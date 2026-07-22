import { getInitialPotikData, getFilteredPotikData } from './potikData';

// IndexedDB Helper Functions
const DB_NAME = 'BpsPotikMonitoringDB';
const DB_VERSION = 1;
const STORE_NAME = 'potik_store';
const KEY_NAME = 'database';
const LOGS_KEY_NAME = 'logs';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

const idbGet = async (key) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB get error:", err);
    return null;
  }
};

const idbSet = async (key, val) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(val, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB set error:", err);
  }
};

// Region Migration Helper
const runRegionMigration = (data) => {
  let hasChanges = false;
  const migratedData = data.map(uni => {
    const formalRegion = uni.city;
    if (formalRegion && uni.region !== formalRegion) {
      hasChanges = true;
      return { ...uni, region: formalRegion };
    }
    return uni;
  });

  return { migratedData, hasChanges };
};

// Helper untuk membaca dari IndexedDB
const getStoredData = async () => {
  let data = await idbGet(KEY_NAME);
  
  // Coba migrasi data dari LocalStorage lama ke IndexedDB jika ada
  const localData = localStorage.getItem('bps_potik_monitoring_db');
  if (localData && !data) {
    try {
      const parsedLocal = JSON.parse(localData);
      if (parsedLocal && Array.isArray(parsedLocal) && parsedLocal.length > 0) {
        data = parsedLocal;
        const { migratedData } = runRegionMigration(data);
        data = migratedData;
        await idbSet(KEY_NAME, data);
        console.log("[apiClient] Berhasil memindahkan database lama dari LocalStorage ke IndexedDB!");

        const localLogs = localStorage.getItem('bps_potik_scraper_logs') || localStorage.getItem('bps_potik_monitoring_logs');
        if (localLogs) {
          try {
            await idbSet(LOGS_KEY_NAME, JSON.parse(localLogs));
          } catch (e) {}
        }
        
        // Hapus data lama di LocalStorage untuk mengosongkan kuota 5MB
        localStorage.removeItem('bps_potik_monitoring_db');
        localStorage.removeItem('bps_potik_scraper_logs');
        localStorage.removeItem('bps_potik_monitoring_logs');
      }
    } catch (e) {
      console.error("[apiClient] Gagal memindahkan database dari LocalStorage:", e);
    }
  }

  // Jika IndexedDB masih kosong (visitor baru / fresh browser), inisialisasi dari potikData.json
  if (!data || !Array.isArray(data) || data.length === 0) {
    data = await getInitialPotikData();
    const { migratedData } = runRegionMigration(data);
    data = migratedData;
    await idbSet(KEY_NAME, data);
    await idbSet(LOGS_KEY_NAME, [
      { timestamp: new Date(Date.now() - 3600000 * 3).toLocaleString('id-ID'), type: "info", message: "Scraper System Initialized. Checking 57 Pojok Statistik endpoints..." },
      { timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString('id-ID'), type: "success", message: "Scrape successful for university_id=7 (ITS). Token: eyJpdiI6IklxeHl... Added 2 new infographics." },
      { timestamp: new Date(Date.now() - 3600000 * 1).toLocaleString('id-ID'), type: "success", message: "Scrape successful for university_id=25 (UB). Token: eyJpdiI6Ik91YW... 1 activity validated." }
    ]);
    setTimeout(() => syncDatabaseToFile(data), 500);
  } else {
    // Data sudah ada di IndexedDB — jalankan migrasi region jika diperlukan
    const { migratedData, hasChanges } = runRegionMigration(data);
    if (hasChanges) {
      data = migratedData;
      await idbSet(KEY_NAME, data);
      setTimeout(() => syncDatabaseToFile(data), 500);
      console.log("[apiClient] IndexedDB region database successfully migrated to Bakorwil!");
    }
  }
  return data;
};

// Kirim database terupdate ke proxy lokal jika sedang berjalan untuk disimpan ke file fisik
const syncDatabaseToFile = async (data) => {
  try {
    await fetch('/api/save-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    console.log("[apiClient] Database successfully synced to local project file (potikData.json)");
  } catch (e) {
    // Abaikan jika proxy offline/tidak dijalankan
  }
};

// Helper untuk menulis ke IndexedDB
const setStoredData = async (data) => {
  await idbSet(KEY_NAME, data);
  // Dispatch event agar component lain tahu ada perubahan data
  window.dispatchEvent(new Event("bps_potik_db_updated"));
  // Singkronkan ke file fisik potikData.json jika proxy menyala
  syncDatabaseToFile(data);
};

// Helper untuk membaca Logs
export const getScraperLogs = async () => {
  let logs = await idbGet(LOGS_KEY_NAME);
  if (!logs) {
    logs = [
      { timestamp: new Date(Date.now() - 3600000 * 3).toLocaleString('id-ID'), type: "info", message: "Scraper System Initialized. Checking 57 Pojok Statistik endpoints..." },
      { timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString('id-ID'), type: "success", message: "Scrape successful for university_id=7 (ITS). Token: eyJpdiI6IklxeHl... Added 2 new infographics." },
      { timestamp: new Date(Date.now() - 3600000 * 1).toLocaleString('id-ID'), type: "success", message: "Scrape successful for university_id=25 (UB). Token: eyJpdiI6Ik91YW... 1 activity validated." }
    ];
    await idbSet(LOGS_KEY_NAME, logs);
  }
  return logs;
};

// Helper untuk menulis Logs (diexport agar Simulator bisa mencatat awal fetch)
export const addScraperLog = async (type, message) => {
  const logs = await getScraperLogs();
  logs.unshift({
    timestamp: new Date().toLocaleString('id-ID'),
    type,
    message
  });
  // Batasi log maksimal 50
  if (logs.length > 50) logs.pop();
  await idbSet(LOGS_KEY_NAME, logs);
  window.dispatchEvent(new Event("bps_potik_logs_updated"));
};

// ==================== EXPORTED API CLIENT EMULATORS ====================

// 1. Fetch seluruh daftar universitas (Potik)
export const fetchPotikList = async () => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const data = await getStoredData();
      resolve(data);
    }, 500); // Simulasi delay jaringan
  });
};

// 2b. Fetch Filtered Monev Data
export const fetchFilteredPotikList = async () => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const data = await getFilteredPotikData();
      resolve(data);
    }, 500);
  });
};

// 2. Fetch detail universitas berdasarkan ID
export const fetchPotikDetail = (id) => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      const data = await getStoredData();
      const potik = data.find(p => p.id === parseInt(id));
      if (potik) {
        resolve(potik);
      } else {
        reject(new Error(`University with ID ${id} not found.`));
      }
    }, 150);
  });
};

// 3. Fetch DataTables Server-Side (Simulasi endpoint /adminpsbe/{type}/datatable)
export const fetchDatatable = (type, universityId, draw = 1, start = 0, length = 10, searchQuery = "", startDate = null, endDate = null) => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      const data = await getStoredData();
      const potik = data.find(p => p.id === parseInt(universityId));
      
      if (!potik) {
        reject(new Error(`University with ID ${universityId} not found.`));
        return;
      }

      const contentList = potik.contents[type] || [];
      
      // Filter berdasarkan pencarian kata kunci di nama/description
      let filteredData = [...contentList];
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.name && item.name.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query)) ||
          (item.author_name && item.author_name.toLowerCase().includes(query))
        );
      }

      // Filter berdasarkan rentang tanggal jika ada
      if (startDate || endDate) {
        const startMs = startDate ? new Date(startDate + "T00:00:00").getTime() : null;
        const endMs = endDate ? new Date(endDate + "T23:59:59").getTime() : null;

        filteredData = filteredData.filter(item => {
          const itemDateStr = item.created_at;
          if (!itemDateStr) return false;
          
          const formattedDateStr = itemDateStr.includes(' ') 
            ? itemDateStr.replace(' ', 'T') 
            : itemDateStr + "T12:00:00";
          const itemMs = new Date(formattedDateStr).getTime();
          
          if (isNaN(itemMs)) return false;
          if (startMs && itemMs < startMs) return false;
          if (endMs && itemMs > endMs) return false;
          return true;
        });
      }

      // Urutkan berdasarkan created_at desc
      filteredData.sort((a, b) => new Date(b.created_at.replace(' ', 'T')) - new Date(a.created_at.replace(' ', 'T')));

      // Potong data sesuai pagination
      const paginatedData = filteredData.slice(start, start + length);

      resolve({
        draw: parseInt(draw),
        recordsTotal: contentList.length,
        recordsFiltered: filteredData.length,
        data: paginatedData
      });
    }, 250);
  });
};

// 4. Fetch Global Feed (Timeline aktivitas terbaru dari semua Potik)
export const fetchLatestFeed = (limit = 10, isFiltered = false) => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const data = isFiltered ? await getFilteredPotikData() : await getStoredData();
      const allFeed = [];

      data.forEach(potik => {
        ['infografis', 'video', 'edukasi', 'kegiatan'].forEach(type => {
          const items = potik.contents[type] || [];
          items.forEach(item => {
            allFeed.push({
              id: item.id,
              type: type,
              title: item.name,
              description: item.description,
              created_at: item.created_at,
              author: item.author_name,
              universityId: potik.id,
              universityName: potik.name,
              universityCity: potik.city,
              universityLogo: potik.logo,
              thumbnail: item.thumbnail
            });
          });
        });
      });

      // Urutkan berdasarkan created_at desc
      allFeed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      resolve(allFeed.slice(0, limit));
    }, 150);
  });
};

// 5. Reset Database ke awal (Kosongkan seluruh konten untuk testing scraping)
export const resetDatabase = async () => {
  const initialData = await getInitialPotikData();
  const { migratedData } = runRegionMigration(initialData);
  const emptyData = migratedData.map(uni => {
    return {
      ...uni,
      status: "Perlu Tindak Lanjut",
      contentsCount: {
        infografis: 0,
        video: 0,
        edukasi: 0,
        kegiatan: 0,
        total: 0
      },
      contents: {
        infografis: [],
        video: [],
        edukasi: [],
        kegiatan: []
      }
    };
  });
  
  await idbSet(KEY_NAME, emptyData);
  
  const initialLogs = [
    { timestamp: new Date().toLocaleString('id-ID'), type: "info", message: "Database has been cleared. Slate is clean. Ready for scraping tests!" }
  ];
  await idbSet(LOGS_KEY_NAME, initialLogs);
  
  window.dispatchEvent(new Event("bps_potik_db_updated"));
  window.dispatchEvent(new Event("bps_potik_logs_updated"));
  
  // Singkronkan database kosong ini ke file fisik potikData.json jika proxy menyala
  syncDatabaseToFile(emptyData);
};

// ==================== SCRAPER SIMULATOR ENGINE ====================

// Simulasi suntikan data baru oleh scraper ke perguruan tinggi tertentu
export const triggerScrapeSimulation = (universityId, contentType) => {
  return new Promise(async (resolve, reject) => {
    const data = await getStoredData();
    const potikIdx = data.findIndex(p => p.id === parseInt(universityId));
    
    if (potikIdx === -1) {
      reject(new Error("University not found"));
      return;
    }

    const potik = data[potikIdx];
    
    // Siapkan judul & isi simulasi baru
    const randomNum = Math.floor(Math.random() * 1000);
    const dateStr = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    
    let newItem = {
      id: Math.floor(Math.random() * 90000) + 10000,
      name: `[SCRAPED] data baru ${contentType} di ${potik.city} #${randomNum}`,
      description: `Data ini berhasil diambil oleh scraper dari database internal BPS pada tanggal ${dateStr}. Topik pembahasan mengenai indikator statistik sektoral daerah Jawa Timur.`,
      penyusun: 2, // Agen
      penyusun_badge: `<span class="badge badge-agen"><i class="fas fa-users"></i> Agen</span>`,
      author_name: `Scraper Bot v1.2 (Magang)`,
      created_at: dateStr,
      views_count: 0,
      likes_count: 0,
      status: 1,
      file: `${contentType}/scraped_${potik.name.replace(/\s+/g, '')}_${randomNum}.png`,
      agen: "scraper.magang@bps.go.id",
      thumbnail: `https://picsum.photos/400/300?random=${randomNum}`
    };

    // Tambahan atribut khusus per tipe data
    if (contentType === "video") {
      newItem.video_url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      newItem.name = `[SCRAPED] Video Edukasi Pojok Statistik ${potik.name} #${randomNum}`;
    } else if (contentType === "edukasi") {
      newItem.type = "Buku/Booklet";
      newItem.name = `[SCRAPED] Publikasi Analisis Statistik Sektoral #${randomNum}`;
    } else if (contentType === "kegiatan") {
      newItem.date = dateStr.split(' ')[0];
      newItem.name = `[SCRAPED] Kegiatan Sosialisasi Pojok Statistik ${potik.name} #${randomNum}`;
    }

    // Tambah item ke array konten universitas
    potik.contents[contentType].unshift(newItem);
    
    // Perbarui jumlah konten
    potik.contentsCount[contentType] += 1;
    potik.contentsCount.total += 1;
    
    // Update status jika sebelumnya Kurang Aktif/Pasif
    if (potik.status === "Perlu Tindak Lanjut" || potik.status === "Kurang Aktif") {
      potik.status = "Aktif";
    }

    // Simpan kembali
    data[potikIdx] = potik;
    await setStoredData(data);

    // Tambahkan log scraper
    await addScraperLog("success", `Scraper successfully extracted 1 new ${contentType} for "${potik.name}" (university_id=${universityId}, token: ${potik.token.substring(0, 15)}...). Data synced to dashboard.`);
    
    resolve(potik);
  });
};

// Impor data asli BPS dari salinan JSON response
export const importScrapedData = (universityId, contentType, datatableResponse) => {
  return new Promise(async (resolve, reject) => {
    try {
      let parsed = datatableResponse;
      if (typeof datatableResponse === 'string') {
        parsed = JSON.parse(datatableResponse);
      }

      if (!parsed || !Array.isArray(parsed.data)) {
        throw new Error("Format DataTables tidak valid (data array tidak ditemukan)");
      }

      const data = await getStoredData();
      const potikIdx = data.findIndex(p => p.id === parseInt(universityId));
      if (potikIdx === -1) {
        throw new Error("Universitas tidak ditemukan");
      }

      const potik = data[potikIdx];
      let importedCount = 0;
      let duplicateCount = 0;

      const existingItems = potik.contents[contentType] || [];
      const newItemsList = [];

      // Iterasi data hasil scrape dari BPS
      parsed.data.forEach(item => {
        // Tentukan thumbnail default berdasarkan kategori jika data kosong
        const BPS_STORAGE_BASE = 'https://pojokstatistik.bps.go.id/storage/';
        let defaultThumbnail = "";
        let ytId = null;

        if (contentType === "video") {
          ytId = item.youtube_id || 
                 (item.url && item.url.length === 11 ? item.url : null) || 
                 (item.youtube_url && item.youtube_url.includes('v=') ? item.youtube_url.split('v=')[1].split('&')[0] : null);
        }

        if (contentType === "infografis") {
          defaultThumbnail = item.thumbnail || (item.file ? (item.file.startsWith('http') ? item.file : BPS_STORAGE_BASE + item.file) : null) || `https://picsum.photos/400/500?random=${item.id || 1}`;
        } else if (contentType === "edukasi") {
          defaultThumbnail = item.poster_url || item.thumbnail || (item.file ? (item.file.startsWith('http') ? item.file : BPS_STORAGE_BASE + item.file) : null) || `https://picsum.photos/300/400?random=${item.id || 1}`;
        } else if (contentType === "video") {
          defaultThumbnail = item.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : `https://picsum.photos/400/225?random=${item.id || 1}`);
        } else {
          defaultThumbnail = item.thumbnail || `https://picsum.photos/600/400?random=${item.id || 1}`;
        }

        // ⚡ NORMALISASI: Jika thumbnail masih berupa relative path (tanpa http/https),
        // tambahkan base URL BPS agar gambar tampil di manapun (termasuk Vercel/hosting lain)
        if (defaultThumbnail && !defaultThumbnail.startsWith('http') && !defaultThumbnail.startsWith('//')) {
          defaultThumbnail = BPS_STORAGE_BASE + defaultThumbnail;
        }

        // Normalisasi item agar pas dengan format kita
        let newItem = {
          id: item.id || (Math.floor(Math.random() * 90000) + 10000),
          name: item.name || item.title || "Tidak ada judul",
          description: item.description || item.prg_name || "Tidak ada deskripsi",
          penyusun: item.penyusun || 1,
          penyusun_badge: item.penyusun_badge || `<span class="badge badge-primary"><i class="fas fa-building"></i> BPS</span>`,
          author_name: item.author_name || "BPS Staff",
          created_at: item.created_at || new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          views_count: item.views_count || 0,
          likes_count: item.likes_count || 0,
          status: item.status || 1,
          file: item.file || "",
          thumbnail: defaultThumbnail,
          agen: item.agen || null
        };

        // Kategori khusus
        if (contentType === "video") {
          newItem.video_url = item.preview_embed_url || 
                              (ytId ? `https://www.youtube.com/embed/${ytId}` : null) || 
                              (item.video_url && item.video_url.includes('embed') ? item.video_url : null) ||
                              (item.instagram_url ? (item.instagram_url.endsWith('/') ? item.instagram_url + 'embed' : item.instagram_url + '/embed') : null) ||
                              "https://www.youtube.com/embed/dQw4w9WgXcQ";
        } else if (contentType === "edukasi") {
          newItem.type = item.type || "Buku/Booklet";
        } else if (contentType === "kegiatan") {
          newItem.date = item.tgl_laksana || item.date || newItem.created_at.split(' ')[0];
        }

        // Cek duplikasi berdasarkan ID
        const existingItemIdx = existingItems.findIndex(ex => ex.id === newItem.id);
        if (existingItemIdx !== -1) {
          // Update data yang sudah ada dengan metadata terbaru dari BPS
          existingItems[existingItemIdx] = {
            ...existingItems[existingItemIdx],
            views_count: newItem.views_count,
            likes_count: newItem.likes_count,
            name: newItem.name,
            description: newItem.description
          };
          duplicateCount++;
        } else {
          newItemsList.push(newItem);
          importedCount++;
        }
      });

      // Gabungkan data lama yang sudah di-update dengan data baru
      potik.contents[contentType] = [...existingItems, ...newItemsList];

      // Perbarui jumlah konten kategori secara akurat
      potik.contentsCount[contentType] = potik.contents[contentType].length;
      potik.contentsCount.total = 
        potik.contentsCount.infografis + 
        potik.contentsCount.video + 
        potik.contentsCount.edukasi + 
        potik.contentsCount.kegiatan;

      // Update status keaktifan secara otomatis berdasarkan jumlah konten
      if (potik.contentsCount.total > 15) {
        potik.status = "Aktif";
      } else if (potik.contentsCount.total > 0) {
        potik.status = "Kurang Aktif";
      } else {
        potik.status = "Perlu Tindak Lanjut";
      }

      data[potikIdx] = potik;
      await setStoredData(data);
      
      // Pemicu event update database
      window.dispatchEvent(new Event("bps_potik_db_updated"));
      
      await addScraperLog("success", `Sinkronisasi Sukses: Seluruh data ${contentType} untuk "${potik.name}" telah diperbarui (${importedCount} baru/terimpor, ${duplicateCount} diperbarui/dilewati).`);
      window.dispatchEvent(new Event("bps_potik_logs_updated"));
      resolve({ importedCount, duplicateCount, potik });
    } catch (err) {
      await addScraperLog("error", `Gagal mengimpor data: ${err.message}`);
      window.dispatchEvent(new Event("bps_potik_logs_updated"));
      reject(err);
    }
  });
};
