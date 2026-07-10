import { getInitialPotikData } from './potikData';

// Kunci LocalStorage untuk database Pojok Statistik
const LOCAL_STORAGE_KEY = "bps_potik_monitoring_db";
const LOGS_STORAGE_KEY = "bps_potik_scraper_logs";

// Inisialisasi Database ke LocalStorage jika belum ada
const initDatabase = () => {
  const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
  let needsUpgrade = !existingData;
  let parsedData = null;
  
  if (existingData) {
    try {
      parsedData = JSON.parse(existingData);
      // Upgrade jika panjang data tidak 57, atau data pertama tidak memiliki logo/bps_id
      if (parsedData.length !== 57 || (parsedData[0] && (!parsedData[0].logo || !parsedData[0].bps_id))) {
        needsUpgrade = true;
      }
    } catch (e) {
      needsUpgrade = true;
    }
  }

  if (needsUpgrade) {
    const initialData = getInitialPotikData();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
    localStorage.removeItem(LOGS_STORAGE_KEY); // Reset logs agar singkron dengan ID universitas baru
    // Singkronkan ke file fisik potikData.json jika proxy menyala
    setTimeout(() => syncDatabaseToFile(initialData), 500);
  } else if (parsedData) {
    // Jalankan migrasi nama region sosiokultural -> Bakorwil formal
    const cityToBakorwil = {
      "Pacitan": "Bakorwil I Madiun",
      "Ngawi": "Bakorwil I Madiun",
      "Magetan": "Bakorwil I Madiun",
      "Madiun": "Bakorwil I Madiun",
      "Nganjuk": "Bakorwil I Madiun",
      "Trenggalek": "Bakorwil I Madiun",
      "Ponorogo": "Bakorwil I Madiun",
      "Kediri": "Bakorwil I Madiun",
      "Tulungagung": "Bakorwil I Madiun",
      "Bojonegoro": "Bakorwil II Bojonegoro",
      "Tuban": "Bakorwil II Bojonegoro",
      "Lamongan": "Bakorwil II Bojonegoro",
      "Jombang": "Bakorwil II Bojonegoro",
      "Mojokerto": "Bakorwil II Bojonegoro",
      "Gresik": "Bakorwil II Bojonegoro",
      "Surabaya": "Bakorwil III Malang",
      "Sidoarjo": "Bakorwil III Malang",
      "Malang": "Bakorwil III Malang",
      "Pasuruan": "Bakorwil III Malang",
      "Blitar": "Bakorwil III Malang",
      "Bangkalan": "Bakorwil IV Pamekasan",
      "Sampang": "Bakorwil IV Pamekasan",
      "Pamekasan": "Bakorwil IV Pamekasan",
      "Sumenep": "Bakorwil IV Pamekasan",
      "Jember": "Bakorwil V Jember",
      "Lumajang": "Bakorwil V Jember",
      "Bondowoso": "Bakorwil V Jember",
      "Situbondo": "Bakorwil V Jember",
      "Probolinggo": "Bakorwil V Jember",
      "Banyuwangi": "Bakorwil V Jember"
    };

    let hasChanges = false;
    const migratedData = parsedData.map(uni => {
      const formalRegion = cityToBakorwil[uni.city];
      if (formalRegion && uni.region !== formalRegion) {
        hasChanges = true;
        return { ...uni, region: formalRegion };
      }
      return uni;
    });

    if (hasChanges) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migratedData));
      setTimeout(() => syncDatabaseToFile(migratedData), 500);
      console.log("[apiClient] LocalStorage region database successfully migrated to Bakorwil!");
    }
  }

  const existingLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  if (!existingLogs) {
    const initialLogs = [
      { timestamp: new Date(Date.now() - 3600000 * 3).toLocaleString('id-ID'), type: "info", message: "Scraper System Initialized. Checking 57 Pojok Statistik endpoints..." },
      { timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString('id-ID'), type: "success", message: "Scrape successful for university_id=7 (ITS). Token: eyJpdiI6IklxeHl... Added 2 new infographics." },
      { timestamp: new Date(Date.now() - 3600000 * 1).toLocaleString('id-ID'), type: "success", message: "Scrape successful for university_id=25 (UB). Token: eyJpdiI6Ik91YW... 1 activity validated." }
    ];
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(initialLogs));
  }
};

initDatabase();

// Helper untuk membaca dari LocalStorage
const getStoredData = () => {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
};

// Kirim database terupdate ke proxy lokal jika sedang berjalan untuk disimpan ke file fisik
const syncDatabaseToFile = async (data) => {
  try {
    await fetch('http://localhost:3001/api/save-database', {
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

// Helper untuk menulis ke LocalStorage
const setStoredData = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  // Dispatch event agar component lain tahu ada perubahan data
  window.dispatchEvent(new Event("bps_potik_db_updated"));
  // Singkronkan ke file fisik potikData.json jika proxy menyala
  syncDatabaseToFile(data);
};

// Helper untuk membaca Logs
export const getScraperLogs = () => {
  return JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY)) || [];
};

// Helper untuk menulis Logs (diexport agar Simulator bisa mencatat awal fetch)
export const addScraperLog = (type, message) => {
  const logs = getScraperLogs();
  logs.unshift({
    timestamp: new Date().toLocaleString('id-ID'),
    type,
    message
  });
  // Batasi log maksimal 50
  if (logs.length > 50) logs.pop();
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  window.dispatchEvent(new Event("bps_potik_logs_updated"));
};

// ==================== EXPORTED API CLIENT EMULATORS ====================

// 1. Fetch seluruh daftar universitas (Potik)
export const fetchPotikList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredData());
    }, 200); // Simulasi delay network
  });
};

// 2. Fetch detail universitas berdasarkan ID
export const fetchPotikDetail = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = getStoredData();
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
// Mendukung pagination (start, length), pencarian (searchQuery), dan rentang tanggal (startDate, endDate)
export const fetchDatatable = (type, universityId, draw = 1, start = 0, length = 10, searchQuery = "", startDate = null, endDate = null) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = getStoredData();
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
          const itemDateStr = item.created_at || item.date;
          if (!itemDateStr) return true;
          // Format standard ISO agar kompatibel di semua engine JS
          const formattedDateStr = itemDateStr.includes(' ') 
            ? itemDateStr.replace(' ', 'T') 
            : itemDateStr + "T12:00:00";
          const itemMs = new Date(formattedDateStr).getTime();
          
          if (isNaN(itemMs)) return true;
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
export const fetchLatestFeed = (limit = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = getStoredData();
      const allFeed = [];

      data.forEach(potik => {
        // Ambil dari infografis, video, edukasi, dan kegiatan
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
export const resetDatabase = () => {
  const initialData = getInitialPotikData();
  
  // Petakan data dasar universitas (logo, nama, koordinat, mou, bps_id) tapi kosongkan kontennya
  const emptyData = initialData.map(uni => {
    return {
      ...uni,
      status: "Perlu Tindak Lanjut",
      engagementScore: 0,
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
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emptyData));
  localStorage.removeItem(LOGS_STORAGE_KEY);
  
  // Tulis logs inisiasi kosong
  const initialLogs = [
    { timestamp: new Date().toLocaleString('id-ID'), type: "info", message: "Database has been cleared. Slate is clean. Ready for scraping tests!" }
  ];
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(initialLogs));
  
  window.dispatchEvent(new Event("bps_potik_db_updated"));
  window.dispatchEvent(new Event("bps_potik_logs_updated"));
  
  // Singkronkan database kosong ini ke file fisik potikData.json jika proxy menyala
  syncDatabaseToFile(emptyData);
};

// ==================== SCRAPER SIMULATOR ENGINE ====================

// Simulasi suntikan data baru oleh scraper ke perguruan tinggi tertentu
export const triggerScrapeSimulation = (universityId, contentType) => {
  return new Promise((resolve, reject) => {
    const data = getStoredData();
    const potikIdx = data.findIndex(p => p.id === parseInt(universityId));
    
    if (potikIdx === -1) {
      reject(new Error("University not found"));
      return;
    }

    const potik = data[potikIdx];
    const typeLabel = contentType.charAt(0).toUpperCase() + contentType.slice(1);
    
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
    
    // Perbarui Engagement Score
    // Infografis = 4, Video = 6, Edukasi = 3, Kegiatan = 8
    let points = 4;
    if (contentType === "video") points = 6;
    else if (contentType === "edukasi") points = 3;
    else if (contentType === "kegiatan") points = 8;
    
    potik.engagementScore = Math.min(potik.engagementScore + points, 100);
    
    // Update status jika sebelumnya Kurang Aktif/Pasif
    if (potik.status === "Perlu Tindak Lanjut" || potik.status === "Kurang Aktif") {
      potik.status = "Aktif";
    }

    // Simpan kembali
    data[potikIdx] = potik;
    setStoredData(data);

    // Tambahkan log scraper
    addScraperLog("success", `Scraper successfully extracted 1 new ${contentType} for "${potik.name}" (university_id=${universityId}, token: ${potik.token.substring(0, 15)}...). Data synced to dashboard.`);
    
    resolve(potik);
  });
};

// Impor data asli BPS dari salinan JSON response
export const importScrapedData = (universityId, contentType, datatableResponse) => {
  return new Promise((resolve, reject) => {
    try {
      let parsed = datatableResponse;
      if (typeof datatableResponse === 'string') {
        parsed = JSON.parse(datatableResponse);
      }

      if (!parsed || !Array.isArray(parsed.data)) {
        throw new Error("Format DataTables tidak valid (data array tidak ditemukan)");
      }

      const data = getStoredData();
      const potikIdx = data.findIndex(p => p.id === parseInt(universityId));
      if (potikIdx === -1) {
        throw new Error("Universitas tidak ditemukan");
      }

      const potik = data[potikIdx];
      let importedCount = 0;

      // Kosongkan list konten kategori terpilih untuk universitas ini agar selalu up-to-date (Truncate)
      potik.contents[contentType] = [];

      // Iterasi data hasil scrape dari BPS
      parsed.data.forEach(item => {
        // Tentukan thumbnail default berdasarkan kategori jika data kosong
        let defaultThumbnail = "";
        if (contentType === "infografis") {
          defaultThumbnail = item.thumbnail || (item.file ? (item.file.startsWith('http') ? item.file : "https://pojokstatistik.bps.go.id/storage/" + item.file) : null) || `https://picsum.photos/400/500?random=${item.id || 1}`;
        } else if (contentType === "edukasi") {
          defaultThumbnail = item.thumbnail || (item.file ? (item.file.startsWith('http') ? item.file : "https://pojokstatistik.bps.go.id/storage/" + item.file) : null) || `https://picsum.photos/300/400?random=${item.id || 1}`;
        } else if (contentType === "video") {
          defaultThumbnail = item.thumbnail || `https://picsum.photos/400/225?random=${item.id || 1}`;
        } else {
          defaultThumbnail = item.thumbnail || `https://picsum.photos/600/400?random=${item.id || 1}`;
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
          // Normalisasi video BPS: Instagram Reels, YouTube, dll
          newItem.video_url = item.preview_embed_url || 
                              item.video_url || 
                              (item.instagram_url ? (item.instagram_url.endsWith('/') ? item.instagram_url + 'embed' : item.instagram_url + '/embed') : null) ||
                              (item.url && item.url.length === 11 ? 'https://www.youtube.com/embed/' + item.url : null) || 
                              "https://www.youtube.com/embed/dQw4w9WgXcQ";
        } else if (contentType === "edukasi") {
          newItem.type = item.type || "Buku/Booklet";
        } else if (contentType === "kegiatan") {
          newItem.date = item.tgl_laksana || item.date || newItem.created_at.split(' ')[0];
        }

        // Simpan data ke array
        potik.contents[contentType].push(newItem);
        importedCount++;
      });

      // Perbarui jumlah konten kategori secara akurat
      potik.contentsCount[contentType] = importedCount;
      potik.contentsCount.total = 
        potik.contentsCount.infografis + 
        potik.contentsCount.video + 
        potik.contentsCount.edukasi + 
        potik.contentsCount.kegiatan;

      // Kalkulasi ulang Engagement Score secara akurat dari awal
      const totalInfografis = potik.contents.infografis.length;
      const totalVideo = potik.contents.video.length;
      const totalEdukasi = potik.contents.edukasi.length;
      const totalKegiatan = potik.contents.kegiatan.length;
      
      const score = (totalInfografis * 4) + (totalVideo * 6) + (totalEdukasi * 3) + (totalKegiatan * 8);
      potik.engagementScore = Math.min(Math.round(score), 100);
      
      // Update status keaktifan secara otomatis berdasarkan jumlah konten
      if (potik.contentsCount.total > 15) {
        potik.status = "Aktif";
      } else if (potik.contentsCount.total > 0) {
        potik.status = "Kurang Aktif";
      } else {
        potik.status = "Perlu Tindak Lanjut";
      }

      data[potikIdx] = potik;
      setStoredData(data);
      
      // Pemicu event update database
      window.dispatchEvent(new Event("bps_potik_db_updated"));
      
      addScraperLog("success", `Sinkronisasi Sukses: Seluruh data ${contentType} untuk "${potik.name}" telah diperbarui (${importedCount} item aktif).`);
      window.dispatchEvent(new Event("bps_potik_logs_updated"));
      resolve({ importedCount, duplicateCount: 0, potik });
    } catch (err) {
      addScraperLog("error", `Gagal mengimpor data: ${err.message}`);
      window.dispatchEvent(new Event("bps_potik_logs_updated"));
      reject(err);
    }
  });
};
