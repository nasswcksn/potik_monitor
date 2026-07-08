import React, { useEffect, useState, useRef } from 'react';
import { 
  Building, 
  CheckCircle2, 
  FileSpreadsheet, 
  TrendingUp, 
  ArrowRight,
  MapPin,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import L from 'leaflet';
import { fetchPotikList, fetchLatestFeed } from '../data/apiClient';

export default function Dashboard({ onSelectPotik, setActiveTab }) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    contents: 0,
    avgScore: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [feed, setFeed] = useState([]);
  const [potiks, setPotiks] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const loadData = async () => {
    try {
      const potikList = await fetchPotikList();
      setPotiks(potikList);

      // Hitung Statistik
      const total = potikList.length;
      const active = potikList.filter(p => p.status === 'Aktif').length;
      const contents = potikList.reduce((acc, p) => acc + p.contentsCount.total, 0);
      const avgScore = Math.round(potikList.reduce((acc, p) => acc + p.engagementScore, 0) / total);

      setStats({ total, active, contents, avgScore });

      // Leaderboard Top 5
      const sorted = [...potikList].sort((a, b) => b.engagementScore - a.engagementScore);
      setLeaderboard(sorted.slice(0, 5));

      // Load Recent Feed
      const recentFeed = await fetchLatestFeed(8);
      setFeed(recentFeed);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  useEffect(() => {
    loadData();

    // Dengarkan perubahan database
    window.addEventListener("bps_potik_db_updated", loadData);
    return () => {
      window.removeEventListener("bps_potik_db_updated", loadData);
    };
  }, []);

  // Inisialisasi Peta Leaflet
  useEffect(() => {
    if (potiks.length === 0) return;

    // Jika peta belum dibuat, inisialisasi
    if (!mapInstance.current && mapRef.current) {
      // Set view ke tengah Jawa Timur
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([-7.75, 112.7], 8.5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      // Event delegation untuk tombol pop-up detail
      const handlePopupClick = (e) => {
        if (e.target && e.target.classList.contains('map-detail-btn')) {
          const id = e.target.getAttribute('data-id');
          if (id) onSelectPotik(parseInt(id));
        }
      };

      mapRef.current.addEventListener('click', handlePopupClick);
    }

    // Perbarui Marker Peta setiap kali data Potiks berubah
    if (mapInstance.current) {
      // Hapus marker lama
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      // Tambahkan marker baru untuk 57 Potik
      potiks.forEach((uni) => {
        let pinClass = 'active'; // Hijau
        if (uni.status === 'Kurang Aktif') pinClass = 'warning'; // Kuning
        else if (uni.status === 'Perlu Tindak Lanjut') pinClass = 'passive'; // Merah

        // Gunakan L.divIcon agar tidak ada masalah asset loading marker default Leaflet
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div class="marker-pin ${pinClass}"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const popupContent = `
          <div class="map-popup-card">
            <div style="display: flex; gap: 0.65rem; align-items: center; margin-bottom: 0.5rem;">
              ${uni.logo ? `<img src="${uni.logo}" alt="${uni.name}" style="width: 32px; height: 32px; object-fit: contain; padding: 2px; background: #ffffff; border-radius: 4px; border: 1px solid var(--border-color); flex-shrink: 0;" />` : ''}
              <div>
                <h4 style="margin: 0; font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${uni.name}</h4>
                <p class="city" style="margin: 0; font-size: 0.7rem; color: var(--text-secondary);"><i class="fas fa-map-marker-alt"></i> ${uni.city} (${uni.region})</p>
              </div>
            </div>
            <div class="popup-stats">
              <div><span>Konten:</span> <b>${uni.contentsCount.total}</b></div>
              <div><span>Skor:</span> <b>${uni.engagementScore}/100</b></div>
            </div>
            <span class="badge ${
              uni.status === 'Aktif' ? 'badge-active' : uni.status === 'Kurang Aktif' ? 'badge-warning' : 'badge-danger'
            }" style="display:inline-block; margin: 0.4rem 0;">${uni.status}</span>
            <button class="map-detail-btn" data-id="${uni.id}">
              Lihat Detail Profile
            </button>
          </div>
        `;

        L.marker([uni.lat, uni.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(popupContent);
      });
    }

    return () => {
      // Bersihkan event listener jika komponen di-destroy
      if (mapRef.current) {
        mapRef.current.removeEventListener('click', () => {});
      }
    };
  }, [potiks]);

  const getContentIcon = (type) => {
    switch(type) {
      case 'infografis': return '📊';
      case 'video': return '🎥';
      case 'edukasi': return '📚';
      case 'kegiatan': return '🤝';
      default: return '📄';
    }
  };

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Welcome Header */}
      <div className="dashboard-header flex-between">
        <div>
          <h1 className="text-gradient-bps">Dashboard Pemantauan</h1>
          <p className="subtitle">Real-time monitoring Pojok Statistik BPS Provinsi Jawa Timur</p>
        </div>
        <div className="date-badge flex-gap-2">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4 stats-grid">
        <div className="glass-card stat-card flex-gap-3">
          <div className="icon-wrapper blue">
            <Building size={24} />
          </div>
          <div>
            <span className="label">Total Potik</span>
            <h3>{stats.total}</h3>
            <span className="subtext">Universitas Mitra</span>
          </div>
        </div>

        <div className="glass-card stat-card flex-gap-3">
          <div className="icon-wrapper green">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="label">Potik Aktif</span>
            <h3>{stats.active} <span className="fraction">/ {stats.total}</span></h3>
            <span className="subtext text-success">{Math.round((stats.active/stats.total)*100)}% Keaktifan</span>
          </div>
        </div>

        <div className="glass-card stat-card flex-gap-3">
          <div className="icon-wrapper orange">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <span className="label">Total Konten</span>
            <h3>{stats.contents}</h3>
            <span className="subtext">Diunggah Agen & BPS</span>
          </div>
        </div>

        <div className="glass-card stat-card flex-gap-3">
          <div className="icon-wrapper cyan">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="label">Rata-rata Skor</span>
            <h3>{stats.avgScore} <span className="fraction">/ 100</span></h3>
            <span className="subtext">Indeks Partisipasi</span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section glass-card">
        <div className="section-header flex-between">
          <div>
            <h3>Peta Sebaran 57 Pojok Statistik Jatim</h3>
            <p>Klik marker pada peta untuk melihat profil ringkas universitas</p>
          </div>
          <div className="map-legend flex-gap-3">
            <div className="legend-item"><span className="dot active"></span> <span>Aktif</span></div>
            <div className="legend-item"><span className="dot warning"></span> <span>Kurang Aktif</span></div>
            <div className="legend-item"><span className="dot passive"></span> <span>Perlu Pembinaan</span></div>
          </div>
        </div>
        <div className="map-container-wrapper">
          <div id="potik-map" ref={mapRef}></div>
        </div>
      </div>

      {/* Leaderboard & Feed Section */}
      <div className="grid-2 dashboard-details">
        {/* Leaderboard Ringkas */}
        <div className="glass-card flex-col">
          <div className="section-header flex-between border-bottom">
            <h3>Top 5 Potik Teraktif</h3>
            <button className="btn-text flex-gap-2" onClick={() => setActiveTab('leaderboard')}>
              Lihat Semua Peringkat <ArrowRight size={16} />
            </button>
          </div>
          <div className="leaderboard-mini-list">
            {leaderboard.map((uni, idx) => (
              <div key={uni.id} className="leaderboard-mini-item flex-between" onClick={() => onSelectPotik(uni.id)}>
                <div className="item-left flex-gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className={`rank-badge rank-${idx + 1}`}>{idx + 1}</div>
                  {uni.logo && (
                    <div style={{ width: '28px', height: '28px', padding: '2px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={uni.logo} alt={uni.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <div>
                    <h4 style={{ margin: 0 }}>{uni.name}</h4>
                    <p className="city-text">{uni.city}</p>
                  </div>
                </div>
                <div className="item-right">
                  <div className="score-val">{uni.engagementScore} Pts</div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${uni.engagementScore}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Feed */}
        <div className="glass-card flex-col">
          <div className="section-header border-bottom">
            <h3>Aktivitas Terbaru</h3>
            <p>Update publikasi konten dari universitas se-Jawa Timur</p>
          </div>
          <div className="activity-timeline">
            {feed.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-line"></div>
                <div className="timeline-icon">{getContentIcon(item.type)}</div>
                <div className="timeline-content">
                  <div className="timeline-meta flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="uni-name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => onSelectPotik(item.universityId)}>
                      {item.universityLogo && (
                        <img src={item.universityLogo} alt={item.universityName} style={{ width: '16px', height: '16px', objectFit: 'contain', background: '#ffffff', padding: '1px', borderRadius: '2px', border: '1px solid var(--border-color)', flexShrink: 0 }} />
                      )}
                      <span>{item.universityName}</span>
                      <ExternalLink size={10} className="inline-icon" />
                    </span>
                    <span className="time">{item.created_at.split(' ')[0]}</span>
                  </div>
                  <h4 className="title">{item.title}</h4>
                  <p className="desc">{item.description.slice(0, 85)}...</p>
                  <div className="timeline-footer flex-between">
                    <span className="author"><User size={12} className="inline-icon" /> {item.author}</span>
                    <span className={`badge-type ${item.type}`}>{item.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dashboard-header .subtitle {
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .date-badge {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-size: 0.85rem;
          font-family: var(--font-heading);
          color: var(--text-primary);
        }

        .stats-grid {
          margin-bottom: 0.5rem;
        }

        .stat-card {
          align-items: center;
          padding: 1.25rem;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
        }

        .icon-wrapper.blue { background: rgba(2, 132, 199, 0.1); color: var(--bps-blue); border: 1px solid rgba(2, 132, 199, 0.2); }
        .icon-wrapper.green { background: rgba(22, 197, 94, 0.1); color: var(--bps-green); border: 1px solid rgba(22, 197, 94, 0.2); }
        .icon-wrapper.orange { background: rgba(234, 88, 12, 0.1); color: var(--bps-orange); border: 1px solid rgba(234, 88, 12, 0.2); }
        .icon-wrapper.cyan { background: rgba(2, 132, 199, 0.1); color: var(--bps-blue); border: 1px solid rgba(2, 132, 199, 0.2); }

        .stat-card .label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
        }

        .stat-card h3 {
          font-size: 1.6rem;
          line-height: 1.2;
          margin: 0.1rem 0;
          color: var(--text-primary);
        }

        .stat-card h3 .fraction {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-card .subtext {
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: block;
        }

        .stat-card .text-success {
          color: var(--bps-green);
          font-weight: 600;
        }

        .map-section {
          padding: 1.5rem;
        }

        .section-header {
          margin-bottom: 1.25rem;
        }

        .section-header h3 {
          font-size: 1.15rem;
        }

        .section-header p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .map-legend {
          font-size: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-secondary);
        }

        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .legend-item .dot.active { background: var(--bps-green); }
        .legend-item .dot.warning { background: var(--bps-orange); }
        .legend-item .dot.passive { background: var(--color-danger); }

        .map-container-wrapper {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
        }

        #potik-map {
          height: 380px;
          width: 100%;
          z-index: 5;
        }

        /* Map Popup Styling */
        .map-popup-card {
          padding: 0.25rem 0.5rem;
          color: var(--text-primary);
          min-width: 180px;
        }

        .map-popup-card h4 {
          font-size: 0.95rem;
          margin-bottom: 0.15rem;
          color: var(--text-primary);
        }

        .map-popup-card .city {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }

        .popup-stats {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.75rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.4rem;
        }

        .map-detail-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--bps-blue) 0%, rgba(2, 132, 199, 0.8) 100%);
          border: none;
          color: #ffffff;
          padding: 0.45rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-family: var(--font-heading);
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.4rem;
          transition: var(--transition-fast);
          text-align: center;
        }

        .map-detail-btn:hover {
          background: var(--bps-blue);
          transform: translateY(-1px);
        }

        /* Dashboard Bottom Section */
        .dashboard-details {
          margin-top: 0.5rem;
        }

        .border-bottom {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.85rem;
        }

        .flex-col {
          display: flex;
          flex-direction: column;
          height: 520px;
        }

        .btn-text {
          background: transparent;
          border: none;
          color: var(--bps-blue);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-text:hover {
          color: var(--bps-blue-light);
          transform: translateX(2px);
        }

        /* Leaderboard Mini List */
        .leaderboard-mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          overflow-y: auto;
          flex: 1;
          padding-right: 0.25rem;
        }

        .leaderboard-mini-item {
          padding: 0.85rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .leaderboard-mini-item:hover {
          background: var(--bg-tertiary);
          border-color: var(--bps-blue-light);
          transform: translateX(4px);
        }

        .rank-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
        }

        .rank-1 { background: linear-gradient(135deg, #ffd700 0%, #cca300 100%); color: #000000; }
        .rank-2 { background: linear-gradient(135deg, #c0c0c0 0%, #909090 100%); color: #000000; }
        .rank-3 { background: linear-gradient(135deg, #cd7f32 0%, #995c1e 100%); }
        .rank-4, .rank-5 { background: var(--bg-tertiary); color: var(--text-secondary); }

        .leaderboard-mini-item h4 {
          font-size: 0.85rem;
          line-height: 1.2;
          color: var(--text-primary);
        }

        .leaderboard-mini-item .city-text {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .leaderboard-mini-item .item-right {
          text-align: right;
          width: 100px;
        }

        .leaderboard-mini-item .score-val {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .progress-bar-bg {
          width: 100%;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--bps-blue) 0%, var(--bps-orange) 100%);
          border-radius: 2px;
        }

        /* Timeline Activities */
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1rem;
          overflow-y: auto;
          flex: 1;
          padding-left: 0.5rem;
          padding-right: 0.25rem;
          position: relative;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }

        .timeline-line {
          position: absolute;
          left: 14px;
          top: 28px;
          bottom: -20px;
          width: 2px;
          background: var(--border-color);
        }

        .timeline-item:last-child .timeline-line {
          display: none;
        }

        .timeline-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          z-index: 2;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .timeline-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          flex: 1;
          transition: var(--transition-fast);
        }

        .timeline-content:hover {
          background: var(--bg-tertiary);
          border-color: var(--bps-blue-light);
        }

        .timeline-meta {
          font-size: 0.7rem;
          margin-bottom: 0.25rem;
        }

        .timeline-meta .uni-name {
          font-weight: 600;
          color: var(--bps-blue);
          cursor: pointer;
        }

        .timeline-meta .uni-name:hover {
          text-decoration: underline;
        }

        .timeline-meta .time {
          color: var(--text-secondary);
        }

        .timeline-content .title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 0.2rem;
        }

        .timeline-content .desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .timeline-footer {
          font-size: 0.65rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.4rem;
        }

        .timeline-footer .author {
          color: var(--text-secondary);
        }

        .timeline-footer .badge-type {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.6rem;
          padding: 0.05rem 0.35rem;
          border-radius: 4px;
        }

        .badge-type.infografis { background: rgba(2, 132, 199, 0.1); color: var(--bps-blue); }
        .badge-type.video { background: rgba(234, 88, 12, 0.1); color: var(--bps-orange); }
        .badge-type.edukasi { background: rgba(2, 132, 199, 0.1); color: var(--bps-blue); }
        .badge-type.kegiatan { background: rgba(22, 197, 94, 0.1); color: var(--bps-green); }
      `}} />
    </div>
  );
}
