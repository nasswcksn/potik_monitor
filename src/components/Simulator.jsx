import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Terminal as TerminalIcon, 
  RefreshCw, 
  CheckCircle, 
  Code, 
  Info,
  Server,
  Sparkles,
  Globe,
  Clipboard,
  Cpu,
  Zap,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchPotikList, getScraperLogs, triggerScrapeSimulation, addScraperLog, importScrapedData } from '../data/apiClient';

// Helper untuk membersihkan dan mengubah tanggal Indonesia ke format YYYY-MM-DD
const cleanIndonesianDate = (dateStr) => {
  const months = {
    januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
    juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12',
    jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', jun: '06', jul: '07', ags: '08', sep: '09', okt: '10', nov: '11', des: '12'
  };
  
  const clean = dateStr.trim().toLowerCase();
  
  // Format standard: DD [Bulan] YYYY
  const match = clean.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthName = match[2];
    const year = match[3];
    const month = months[monthName] || '01';
    return `${year}-${month}-${day}`;
  }
  
  // Format YYYY-MM-DD
  const isoMatch = clean.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // Format DD-MM-YYYY
  const reverseMatch = clean.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (reverseMatch) {
    return `${reverseMatch[3]}-${reverseMatch[2]}-${reverseMatch[1]}`;
  }
  
  return dateStr;
};

// Helper to parse Laravel HTML table for kegiatan-lain
const parseHtmlToKegiatanJson = (htmlString, bpsUniId) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Cari tabel data yang benar (prioritaskan yang punya class .table atau memiliki elemen <th>)
    const tables = Array.from(doc.querySelectorAll('table'));
    let table = doc.querySelector('table.table') || tables.find(t => t.querySelector('th')) || tables[0];

    if (!table) {
      throw new Error("Tidak menemukan tabel data di dalam halaman HTML BPS.");
    }
    
    // Ambil semua baris data (tr) dan saring baris yang berisi header (th)
    const rows = Array.from(table.querySelectorAll('tr')).filter(tr => !tr.querySelector('th'));
    const extractedData = [];
    
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return; // Lewati baris kosong / pagination info
      
      const textCells = Array.from(cells).map(c => c.textContent.trim());
      
      // Deteksi jika tabel kosong ("No data available" dsb)
      if (cells.length === 1 && (textCells[0].includes('tidak') || textCells[0].toLowerCase().includes('no data'))) {
        return;
      }
      
      let name = "";
      let desc = "";
      let author = "Pembinaan Agen Statistik";
      let dateRaw = new Date().toISOString().split('T')[0];
      let id = 40000 + index + Math.floor(Math.random() * 1000);
      
      // Ambil ID asli dari link Aksi (contoh: edit/delete link /adminpsbe/kegiatan-lain/123/edit)
      const actionLink = row.querySelector('a[href*="/kegiatan-lain/"], a[href*="/edit"]');
      if (actionLink) {
        const href = actionLink.getAttribute('href');
        const match = href.match(/\/kegiatan-lain\/(\d+)/) || href.match(/\/(\d+)\/edit/);
        if (match) {
          id = parseInt(match[1]);
        }
      }
      
      // 1. Identifikasi Cell Tanggal (mengandung angka tahun 202x atau nama bulan Indonesia)
      const dateCellIndex = textCells.findIndex(text => {
        return /\b\d{4}[-/]\d{2}[-/]\d{2}\b/.test(text) || 
               /\b\d{2}[-/]\d{2}[-/]\d{4}\b/.test(text) || 
               /\b(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b/i.test(text) ||
               (/\b202\d\b/.test(text) && text.length < 30);
      });
      if (dateCellIndex !== -1) {
        dateRaw = textCells[dateCellIndex];
      }
      
      // 2. Identifikasi Cell Deskripsi (teks paling panjang)
      let maxLength = 0;
      let descCellIndex = -1;
      textCells.forEach((text, i) => {
        if (i === 0) return; // Lewati kolom No
        if (i === dateCellIndex) return; // Lewati kolom tanggal yang sudah ketemu
        if (text.length > maxLength) {
          maxLength = text.length;
          descCellIndex = i;
        }
      });
      if (descCellIndex !== -1) {
        desc = textCells[descCellIndex];
      }
      
      // 3. Identifikasi Cell Judul / Nama Kegiatan (kolom pertama non-kosong yang bukan deskripsi/tanggal)
      let nameCellIndex = textCells.findIndex((text, i) => {
        return i > 0 && i !== descCellIndex && i !== dateCellIndex && text.length > 3 && text.length < 120;
      });
      if (nameCellIndex !== -1) {
        name = textCells[nameCellIndex];
      } else {
        name = textCells[1] || "Kegiatan Pojok Statistik";
      }
      
      // 4. Identifikasi Cell Author / Penyusun (kolom tersisa yang berisi teks sedang)
      let authorCellIndex = textCells.findIndex((text, i) => {
        return i > 0 && i !== descCellIndex && i !== dateCellIndex && i !== nameCellIndex && text.length > 2 && text.length < 150;
      });
      if (authorCellIndex !== -1) {
        author = textCells[authorCellIndex];
      }
      
      // Ambil foto dari tag img di baris table jika ada (real image dari portal BPS)
      const img = row.querySelector('img');
      let extractedThumbnail = img ? img.getAttribute('src') : null;
      if (extractedThumbnail && !extractedThumbnail.startsWith('http')) {
        extractedThumbnail = extractedThumbnail.startsWith('/') 
          ? `https://pojokstatistik.bps.go.id${extractedThumbnail}`
          : `https://pojokstatistik.bps.go.id/${extractedThumbnail}`;
      }

      // Format tanggal ke YYYY-MM-DD
      const cleanedDate = cleanIndonesianDate(dateRaw);
      
      // Bersihkan deskripsi jika gagal diekstrak
      if (!desc) {
        desc = `Dokumentasi kegiatan Pojok Statistik oleh ${author} pada tanggal ${cleanedDate}.`;
      }
      
      extractedData.push({
        id: id,
        name: name,
        description: desc,
        penyusun: 2, // Default: Agen
        penyusun_badge: '<span class="badge badge-success" style="font-size:100% !important;"><i class="fas fa-users fa-fw"></i> Agen</span>',
        author_name: author.split('(')[0].trim(),
        created_at: cleanedDate.includes(':') ? cleanedDate : cleanedDate + " 10:00:00",
        views_count: Math.floor(Math.random() * 80) + 1,
        likes_count: Math.floor(Math.random() * 15),
        status: 1,
        file: "",
        thumbnail: extractedThumbnail || `https://picsum.photos/600/400?random=${id}`,
        date: cleanedDate.split(' ')[0],
        agen: author.toLowerCase().includes('@') ? author.trim() : "staff@bps.go.id"
      });
    });
    
    return {
      draw: 1,
      recordsTotal: extractedData.length,
      recordsFiltered: extractedData.length,
      data: extractedData
    };
  } catch (err) {
    console.error("Gagal mem-parsing HTML Kegiatan:", err);
    throw new Error("Gagal mengekstrak data dari halaman HTML BPS. Pastikan struktur tabel sesuai.");
  }
};

export default function Simulator() {
  const [potiks, setPotiks] = useState([]);
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedType, setSelectedType] = useState("infografis");
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  // State baru untuk integrasi API BPS
  const [activeSubTab, setActiveSubTab] = useState("mock"); // "mock" | "real"
  const [integrationMode, setIntegrationMode] = useState("proxy"); // "proxy" | "paste"
  const [pasteJson, setPasteJson] = useState("");
  const [cookieInput, setCookieInput] = useState("");
  const [bpsUniId, setBpsUniId] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [isProxyOnline, setIsProxyOnline] = useState(false);
  const [proxyLoading, setProxyLoading] = useState(false);
  const [isAutoScrape, setIsAutoScrape] = useState(true); // Paginasi otomatis
  const [scrapeDelay, setScrapeDelay] = useState("2000"); // Jeda 2 detik antar request untuk menghindari rate-limit BPS

  const terminalEndRef = useRef(null);

  // Auto scroll terminal logs ke paling bawah
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const loadData = async () => {
    try {
      const data = await fetchPotikList();
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setPotiks(sorted);
      if (sorted.length > 0 && !selectedUni) {
        setSelectedUni(sorted[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadLogs = async () => {
    setLogs(await getScraperLogs());
  };

  const checkProxyStatus = async () => {
    try {
      const res = await fetch('/api/fetch');
      if (res.status === 400) {
        setIsProxyOnline(true);
      } else {
        setIsProxyOnline(false);
      }
    } catch (e) {
      setIsProxyOnline(false);
    }
  };

  useEffect(() => {
    loadData();
    loadLogs();

    window.addEventListener("bps_potik_logs_updated", loadLogs);
    return () => {
      window.removeEventListener("bps_potik_logs_updated", loadLogs);
    };
  }, []);

  // Ping proxy secara berkala saat tab real-time aktif
  useEffect(() => {
    if (activeSubTab === 'real' && integrationMode === 'proxy') {
      checkProxyStatus();
      const interval = setInterval(checkProxyStatus, 4000);
      return () => clearInterval(interval);
    }
  }, [activeSubTab, integrationMode]);

  // Perbarui tebakan BPS ID & endpoint path saat universitas/tipe berubah
  useEffect(() => {
    if (selectedUni) {
      const uni = potiks.find(p => p.id === parseInt(selectedUni));
      if (uni) {
        // Gunakan bps_id dari database jika ada
        setBpsUniId(uni.bps_id ? uni.bps_id.toString() : "");
      }
    }
    
    // Tentukan default path berdasarkan kategori BPS
    if (integrationMode === 'proxy') {
      setCustomPath("/adminpsbe/kegiatan-lain/datatable");
    } else {
      if (selectedType === "kegiatan") {
        setCustomPath("/adminpsbe/kegiatan-lain/datatable");
      } else {
        setCustomPath(`/adminpsbe/${selectedType}/datatable`);
      }
    }
  }, [selectedUni, selectedType, integrationMode, potiks]);

  const handleSimulate = async () => {
    if (!selectedUni) return;
    setIsRunning(true);

    const chosenUni = potiks.find(p => p.id === parseInt(selectedUni));
    if (chosenUni) {
      addScraperLog("info", `[FETCH] Scraper outbound GET request ke /adminpsbe/${selectedType}/datatable?university_id=${chosenUni.token.substring(0, 15)}...`);
    }

    setTimeout(async () => {
      try {
        const updatedPotik = await triggerScrapeSimulation(selectedUni, selectedType);
        const newItems = updatedPotik.contents[selectedType];
        const latestItem = newItems[0];

        const mockResponse = {
          draw: 1,
          recordsTotal: newItems.length,
          recordsFiltered: newItems.length,
          data: [latestItem]
        };

        setLastResponse(mockResponse);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#ea580c', '#10b981']
        });
      } catch (err) {
        console.error("Simulation failed:", err);
      } finally {
        setIsRunning(false);
      }
    }, 1500);
  };

  const handleImportJson = async () => {
    if (!pasteJson.trim()) {
      alert("Silakan tempel (paste) response JSON dari BPS terlebih dahulu.");
      return;
    }

    try {
      let parsed;
      try {
        parsed = JSON.parse(pasteJson);
      } catch (e) {
        alert("Gagal parsing JSON: Pastikan teks yang Anda tempel adalah format JSON yang valid.");
        return;
      }

      const chosenUni = potiks.find(p => p.id === parseInt(selectedUni));
      addScraperLog("info", `[MANUAL IMPORT] Memulai impor data ${selectedType} asli untuk "${chosenUni?.name || 'Universitas'}"...`);
      
      const res = await importScrapedData(selectedUni, selectedType, parsed);
      setLastResponse(parsed);

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#ea580c', '#10b981']
      });

      alert(`Sukses mengimpor data! ${res.importedCount} item baru ditambahkan, ${res.duplicateCount} item duplikat diabaikan.`);
      setPasteJson("");
    } catch (err) {
      alert("Error Impor: " + err.message);
    }
  };

  const handleFetchProxy = async () => {
    if (!isProxyOnline) {
      alert("Proxy server lokal belum aktif. Jalankan 'npm run proxy' terlebih dahulu di terminal proyek.");
      return;
    }
    if (!cookieInput.trim()) {
      alert("Silakan masukkan BPS Admin Cookie Anda terlebih dahulu untuk autentikasi.");
      return;
    }

    const chosenUni = potiks.find(p => p.id === parseInt(selectedUni));
    if (!chosenUni) return;

    setProxyLoading(true);
    
    const categories = ['infografis', 'video', 'edukasi', 'kegiatan'];
    const delayMs = parseInt(scrapeDelay) || 2000;
    
    let totalImportedGlobal = 0;
    let totalDuplicatesGlobal = 0;

    addScraperLog("info", `🚀 [BATCH RUN] Memulai penarikan data 4 Kategori sekaligus untuk "${chosenUni.name}"...`);

    let cookieHeaderValue = cookieInput.trim();
    if (cookieHeaderValue && !cookieHeaderValue.includes('=')) {
      cookieHeaderValue = `pojokstatisik_session=${cookieHeaderValue}`;
    }

    for (let c = 0; c < categories.length; c++) {
      const currentCat = categories[c];
      const catLabel = currentCat === 'edukasi' ? 'Edukasi Statistik' : 
                       currentCat === 'kegiatan' ? 'Kegiatan Lainnya' : 
                       currentCat.charAt(0).toUpperCase() + currentCat.slice(1);
      
      addScraperLog("info", `----------------------------------------`);
      addScraperLog("info", `📂 Memulai kategori: [${catLabel}]`);

      // Tentukan path API BPS untuk kategori ini
      let catPath = `/adminpsbe/${currentCat}/datatable`;
      if (currentCat === "kegiatan") {
        catPath = customPath.trim().includes("kegiatan") ? customPath.trim() : "/adminpsbe/kegiatan-lain/datatable";
      }

      let currentStart = 0;
      const batchLength = 100;
      let hasMore = true;
      let catImported = 0;
      let catDuplicates = 0;

      while (hasMore) {
        addScraperLog("info", `[PROXY FETCH] Menghubungi proxy (Kategori: ${catLabel}, Start: ${currentStart}, Length: ${batchLength})...`);
        
        let bpsBaseUrl = `https://pojokstatistik.bps.go.id${catPath}`;
        if (catPath.includes('datatable')) {
          bpsBaseUrl += `?draw=1&start=${currentStart}&length=${batchLength}&university_id=${bpsUniId}`;
        } else {
          bpsBaseUrl += `?university_id=${bpsUniId}`;
          hasMore = false;
        }
        
        const proxyUrl = `/api/fetch?url=${encodeURIComponent(bpsBaseUrl)}`;

        try {
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'X-BPS-Cookie': cookieHeaderValue
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
          }

          const resText = await response.text();
          let resJson;
          
          if (resText.includes('/login') || resText.includes('login-box') || resText.includes('name="username"') || resText.includes('name="password"')) {
            throw new Error("Sesi Cookie BPS Anda sudah kedaluwarsa atau tidak valid (Dialihkan ke halaman login BPS).");
          }

          if (resText.trim().startsWith('<') || resText.includes('<!DOCTYPE') || resText.includes('<html')) {
            if (currentCat === "kegiatan") {
              addScraperLog("info", "📄 [PARSER] Terdeteksi respon HTML. Menjalankan parser DOM HTML...");
              resJson = parseHtmlToKegiatanJson(resText, bpsUniId);
              addScraperLog("success", `[PARSER] Berhasil mengekstrak ${resJson.data.length} data kegiatan dari tabel HTML BPS!`);
              hasMore = false;
            } else {
              throw new Error("Menerima respon HTML dari BPS yang tidak diharapkan.");
            }
          } else {
            resJson = JSON.parse(resText);
          }
          
          setLastResponse(resJson);

          const resImport = await importScrapedData(selectedUni, currentCat, resJson);
          catImported += resImport.importedCount;
          catDuplicates += resImport.duplicateCount;
          totalImportedGlobal += resImport.importedCount;
          totalDuplicatesGlobal += resImport.duplicateCount;

          const recordsFiltered = resJson.recordsFiltered || 0;
          const recordsReturned = (resJson.data || []).length;

          addScraperLog("success", `[${catLabel}] Sukses mengambil ${recordsReturned} data. (${resImport.importedCount} baru, ${resImport.duplicateCount} diperbarui/dilewati).`);

          if (recordsReturned < batchLength || (currentStart + recordsReturned) >= recordsFiltered || !catPath.includes('datatable')) {
            hasMore = false;
          } else {
            currentStart += batchLength;
            addScraperLog("info", `⏳ Jeda ${delayMs}ms sebelum mengambil halaman berikutnya...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }

        } catch (err) {
          addScraperLog("error", `[${catLabel} FAIL] Gagal memanggil API BPS pada baris ${currentStart}: ${err.message}`);
          hasMore = false;
          addScraperLog("info", `Mengabaikan sisa kategori ${catLabel} karena kendala error.`);
        }
      }

      addScraperLog("success", `[${catLabel} SELESAI] Total Terimpor: ${catImported} baru, ${catDuplicates} diperbarui.`);

      if (c < categories.length - 1) {
        addScraperLog("info", `⏳ Jeda ${delayMs}ms sebelum beralih ke kategori berikutnya...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    setProxyLoading(false);

    if (totalImportedGlobal > 0) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#ea580c', '#10b981']
      });
    }

    alert(`[SINKRONISASI 4 KATEGORI SELESAI]\nBerhasil memproses semua data untuk ${chosenUni.name}.\n\nTotal data baru terimpor: ${totalImportedGlobal} item\nTotal data diperbarui/dilewati: ${totalDuplicatesGlobal} item`);
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '🟢';
      case 'error': return '🔴';
      default: return '🔵';
    }
  };

  return (
    <div className="simulator-view animate-fade-in">
      {/* Header */}
      <div className="simulator-header">
        <h1 className="text-gradient-bps">Integrasi API & Scraper</h1>
        <p className="subtitle">Lakukan sinkronisasi data dari portal Pojok Statistik BPS asli secara dinamis</p>
      </div>

      <div className="grid-2 simulator-layout">
        {/* Left Side: Controls & Logs */}
        <div className="simulator-left">
          {/* Controls Panel */}
          <div className="glass-card controls-card">
            <h3><Server size={16} className="inline-icon icon-blue" /> Control Engine Panel</h3>
            <p className="section-desc text-secondary">
              Pilih mode penarikan data: simulasi mock untuk demonstrasi cepat, atau integrasi API riil untuk menyambungkan data asli.
            </p>

            {/* Sub-Tab Navigation */}
            <div className="tab-buttons-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <button 
                className={`tab-btn ${activeSubTab === 'mock' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('mock')}
                style={{ padding: '0.5rem 1rem', border: 'none', background: activeSubTab === 'mock' ? 'var(--bps-blue)' : 'transparent', color: activeSubTab === 'mock' ? '#fff' : 'var(--text-secondary)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Cpu size={14} />
                <span>Simulasi Mock</span>
              </button>
              <button 
                className={`tab-btn ${activeSubTab === 'real' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('real')}
                style={{ padding: '0.5rem 1rem', border: 'none', background: activeSubTab === 'real' ? 'var(--bps-blue)' : 'transparent', color: activeSubTab === 'real' ? '#fff' : 'var(--text-secondary)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Globe size={14} />
                <span>Integrasi API</span>
              </button>
            </div>

            {/* MOCK MODE CONTROLS */}
            {activeSubTab === 'mock' && (
              <div className="form-layout">
                <div className="form-group">
                  <label>Pilih Universitas (Target local ID):</label>
                  <select 
                    value={selectedUni} 
                    onChange={(e) => setSelectedUni(e.target.value)}
                    className="input-control select-control"
                    disabled={isRunning}
                  >
                    {potiks.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id} - {p.city})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Kategori Data (Target API Path):</label>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input-control select-control"
                    disabled={isRunning}
                  >
                    <option value="infografis">/infografis/datatable</option>
                    <option value="video">/video/datatable</option>
                    <option value="edukasi">/edukasi/datatable</option>
                    <option value="kegiatan">/kegiatan/datatable</option>
                  </select>
                </div>

                <button 
                  className={`btn btn-primary btn-run-scraper ${isRunning ? 'running' : ''}`}
                  onClick={handleSimulate}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="spinner" size={16} />
                      <span>Simulating Scraper...</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Jalankan Simulator Mock</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* REAL API MODE CONTROLS */}
            {activeSubTab === 'real' && (
              <div className="form-layout">
                {/* Mode Select */}
                <div className="integration-mode-select" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', background: 'var(--bg-tertiary)', padding: '0.4rem', borderRadius: '8px' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', background: integrationMode === 'proxy' ? 'var(--bg-secondary)' : 'transparent', border: integrationMode === 'proxy' ? '1px solid var(--border-color)' : '1px solid transparent', justifyContent: 'center', color: integrationMode === 'proxy' ? 'var(--bps-blue)' : 'var(--text-secondary)' }}>
                    <input type="radio" checked={integrationMode === 'proxy'} onChange={() => setIntegrationMode('proxy')} style={{ display: 'none' }} />
                    <Zap size={12} /> Proxy Server Lokal
                  </label>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', background: integrationMode === 'paste' ? 'var(--bg-secondary)' : 'transparent', border: integrationMode === 'paste' ? '1px solid var(--border-color)' : '1px solid transparent', justifyContent: 'center', color: integrationMode === 'paste' ? 'var(--bps-blue)' : 'var(--text-secondary)' }}>
                    <input type="radio" checked={integrationMode === 'paste'} onChange={() => setIntegrationMode('paste')} style={{ display: 'none' }} />
                    <Clipboard size={12} /> Copy-Paste JSON
                  </label>
                </div>

                {/* COMMON FORM FIELDS FOR REAL MODE */}
                <div className="form-group">
                  <label>Pilih Universitas Tujuan Dashboard:</label>
                  <select 
                    value={selectedUni} 
                    onChange={(e) => setSelectedUni(e.target.value)}
                    className="input-control select-control"
                    disabled={proxyLoading}
                  >
                    {potiks.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                    ))}
                  </select>
                </div>

                {integrationMode !== 'proxy' && (
                  <div className="form-group">
                    <label>Kategori Sumber Data:</label>
                    <select 
                      value={selectedType} 
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="input-control select-control"
                      disabled={proxyLoading}
                    >
                      <option value="infografis">Infografis</option>
                      <option value="video">Video Edukasi</option>
                      <option value="edukasi">Edukasi Statistik</option>
                      <option value="kegiatan">Kegiatan Lainnya</option>
                    </select>
                  </div>
                )}

                {/* MODE A: LIVE PROXY */}
                {integrationMode === 'proxy' && (
                  <>
                    {/* Proxy Status Indicator */}
                    <div className="proxy-status-indicator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: isProxyOnline ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', border: isProxyOnline ? '1px solid rgba(34, 197, 94, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem', color: isProxyOnline ? 'var(--bps-green)' : 'var(--color-danger)' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isProxyOnline ? 'var(--bps-green)' : 'var(--color-danger)', display: 'inline-block' }}></span>
                        Proxy Lokal: {isProxyOnline ? 'ONLINE' : 'OFFLINE'}
                      </span>
                      {!isProxyOnline && <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Jalankan <code>npm run proxy</code> di terminal</span>}
                    </div>

                    <div className="form-group">
                      <label>University ID (BPS Database):</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: 68" 
                        value={bpsUniId} 
                        onChange={(e) => setBpsUniId(e.target.value)}
                        className="input-control"
                        disabled={proxyLoading}
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>



                    <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input 
                          type="checkbox" 
                          checked={isAutoScrape} 
                          onChange={(e) => setIsAutoScrape(e.target.checked)}
                          disabled={proxyLoading}
                        />
                        Jeda Waktu (Set-Interval)
                      </label>
                      
                      {isAutoScrape && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Jeda:</span>
                          <input 
                            type="number" 
                            value={scrapeDelay} 
                            onChange={(e) => setScrapeDelay(e.target.value)}
                            className="input-control"
                            disabled={proxyLoading}
                            min="500"
                            style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', fontSize: '0.7rem', width: '80px', height: '26px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                          />
                          <span style={{ color: 'var(--text-secondary)' }}>ms</span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>BPS Admin Cookie Header (Autentikasi):</label>
                      <input 
                        type="text" 
                        placeholder="Tempel header cookie: laravel_session=..." 
                        value={cookieInput} 
                        onChange={(e) => setCookieInput(e.target.value)}
                        className="input-control"
                        disabled={proxyLoading}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Buka BPS Web Admin {"→"} F12 Inspect {"→"} Network {"→"} Salin header <b>Cookie</b> di header HTTP request BPS.
                      </span>
                    </div>

                    <div className="form-group">
                      <label>{integrationMode === 'proxy' ? 'Edit Path Khusus (Kategori Kegiatan):' : 'Edit Custom API Endpoint Path:'}</label>
                      <input 
                        type="text" 
                        value={customPath} 
                        onChange={(e) => setCustomPath(e.target.value)}
                        className="input-control"
                        disabled={proxyLoading}
                        style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <button 
                      className={`btn btn-primary btn-run-scraper ${proxyLoading ? 'running' : ''}`}
                      onClick={handleFetchProxy}
                      disabled={proxyLoading || !isProxyOnline}
                      style={{ background: 'linear-gradient(135deg, var(--bps-orange) 0%, var(--bps-orange-light) 100%)', borderColor: 'var(--bps-orange)' }}
                    >
                      {proxyLoading ? (
                        <>
                          <RefreshCw className="spinner" size={16} />
                          <span>Menarik 4 Kategori Sekaligus...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          <span>Start Scraping (infografis, video, edukasi, kegiatan)</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* MODE B: COPY PASTE JSON */}
                {integrationMode === 'paste' && (
                  <>
                    <div className="payload-info-banner flex-gap-2" style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
                      <Info size={16} className="icon-blue" />
                      <span style={{ fontSize: '0.7rem' }}>
                        Salin JSON kembalian DataTables BPS asli dari browser, lalu tempelkan di kotak textarea di bawah.
                      </span>
                    </div>

                    <div className="form-group">
                      <label>Tempel Response JSON:</label>
                      <textarea 
                        placeholder='{"draw": 1, "recordsTotal": 27, "data": [...] }'
                        value={pasteJson}
                        onChange={(e) => setPasteJson(e.target.value)}
                        className="input-control"
                        rows={6}
                        style={{ fontFamily: 'monospace', fontSize: '0.75rem', resize: 'vertical' }}
                      />
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={handleImportJson}
                      style={{ background: 'linear-gradient(135deg, var(--bps-green) 0%, #059669 100%)', borderColor: 'var(--bps-green)' }}
                    >
                      <Clipboard size={16} />
                      <span>Impor Data Sekarang</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Terminal Logs Panel */}
          <div className="glass-card terminal-card flex-col" style={{ height: '310px' }}>
            <div className="terminal-header flex-between border-bottom">
              <span className="flex-gap-2 font-bold">
                <TerminalIcon size={16} className="color-success" />
                Scraper Logs Terminal
              </span>
              <span className="terminal-status flex-gap-2">
                <span className="ping-dot"></span> LIVE LISTENING
              </span>
            </div>
            <div className="terminal-body">
              {isRunning && (
                <div className="log-row pending">
                  <span className="log-time">{new Date().toLocaleTimeString('id-ID')}</span>
                  <span className="log-msg">⚡ [FETCH] Scraping in progress. Fetching AJAX data...</span>
                </div>
              )}
              {logs.map((log, idx) => (
                <div key={idx} className={`log-row ${log.type}`}>
                  <span className="log-time">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  <span className="log-msg">
                    {getLogIcon(log.type)} {log.message}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* Right Side: Payload Response Preview */}
        <div className="simulator-right glass-card flex-col">
          <div className="section-header border-bottom flex-between">
            <div>
              <h3><Code size={16} className="inline-icon icon-blue" /> Response JSON Payload</h3>
              <p>Simulasi payload kembalian dari endpoint DataTables server-side BPS</p>
            </div>
            {lastResponse && (
              <span className="badge badge-active flex-gap-1">
                <Sparkles size={12} /> HTTP 200 OK
              </span>
            )}
          </div>
          
          <div className="payload-preview-body">
            {lastResponse ? (
              <div className="payload-content">
                <div className="payload-info-banner flex-gap-2">
                  <Info size={16} className="icon-blue" />
                  <span>
                    Data berikut sukses disinkronkan ke database utama dashboard. Peta, grafik, dan leaderboard ter-update!
                  </span>
                </div>
                <pre className="json-code">
                  <code>{JSON.stringify(lastResponse, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="empty-payload flex-center flex-col">
                <Code size={40} className="text-muted" />
                <p>Belum ada data scraper yang dijalankan.</p>
                <p className="subtext">Klik tombol "Jalankan Simulator" di samping untuk melihat respons JSON.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .simulator-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .simulator-header .subtitle {
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .simulator-layout {
          align-items: start;
        }

        .simulator-left {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .controls-card {
          padding: 1.5rem;
        }

        .controls-card h3 {
          font-size: 1.05rem;
          margin-bottom: 0.25rem;
        }

        .section-desc {
          font-size: 0.8rem;
          line-height: 1.45;
          margin-bottom: 1.25rem;
        }

        .form-layout {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-group label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .btn-run-scraper {
          margin-top: 0.5rem;
          justify-content: center;
          padding: 0.75rem;
          width: 100%;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Terminal card */
        .terminal-card {
          padding: 1.25rem;
          height: 250px;
        }

        .terminal-header {
          padding-bottom: 0.65rem;
          font-size: 0.85rem;
        }

        .terminal-status {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--color-success);
        }

        .ping-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-success);
          position: relative;
        }

        .ping-dot::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--color-success);
          animation: status-ping 1.5s infinite;
        }

        .terminal-body {
          height: 210px;
          background: #030712;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem;
          margin-top: 0.75rem;
          font-family: monospace;
          font-size: 0.75rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          color: #f3f4f6;
        }

        .log-row {
          line-height: 1.4;
        }

        .log-time {
          color: var(--text-muted);
          margin-right: 0.5rem;
        }

        .log-row.success { color: #f3f4f6; }
        .log-row.info { color: var(--bps-blue-light); }
        .log-row.error { color: var(--color-danger); }
        .log-row.pending { color: var(--color-warning); }

        /* Payload card */
        .simulator-right {
          padding: 1.5rem;
          min-height: 680px;
          height: auto;
        }

        .payload-preview-body {
          flex: 1;
          margin-top: 1rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .payload-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }

        .payload-info-banner {
          background: rgba(2, 132, 199, 0.08);
          border: 1px solid rgba(2, 132, 199, 0.15);
          border-radius: 8px;
          padding: 0.65rem 0.85rem;
          font-size: 0.75rem;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .json-code {
          height: 480px;
          max-height: 480px;
          background: #030712;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.75rem;
          overflow: auto;
          color: var(--color-success);
          text-align: left;
        }

        .empty-payload {
          height: 100%;
          color: var(--text-muted);
          gap: 0.5rem;
        }

        .empty-payload .subtext {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
        }

        @media (max-width: 768px) {
          .simulator-header h1 {
            font-size: 1.5rem;
          }
          .tab-buttons-row {
            overflow-x: auto;
            width: 100%;
            padding-bottom: 0.5rem;
          }
          .tab-buttons-row .tab-btn {
            flex-shrink: 0;
          }
          .integration-mode-select {
            flex-direction: column;
            gap: 0.5rem;
          }
          .json-code {
            height: 300px;
            max-height: 300px;
          }
        }
      `}} />
    </div>
  );
}
