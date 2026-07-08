import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  FileText, 
  Video, 
  BookOpen, 
  Users, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { fetchPotikList } from '../data/apiClient';

export default function PotikList({ onSelectPotik }) {
  const [potiks, setPotiks] = useState([]);
  const [filteredPotiks, setFilteredPotiks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const loadData = async () => {
    try {
      const data = await fetchPotikList();
      setPotiks(data);
    } catch (err) {
      console.error("Error loading Potik list:", err);
    }
  };

  useEffect(() => {
    loadData();

    window.addEventListener("bps_potik_db_updated", loadData);
    return () => {
      window.removeEventListener("bps_potik_db_updated", loadData);
    };
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...potiks];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.university.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query)
      );
    }

    // Region filter
    if (selectedRegion !== "All") {
      result = result.filter(p => p.region === selectedRegion);
    }

    // Status filter
    if (selectedStatus !== "All") {
      result = result.filter(p => p.status === selectedStatus);
    }

    setFilteredPotiks(result);
  }, [search, selectedRegion, selectedStatus, potiks]);

  const getLogoPlaceholder = (name) => {
    // Ambil inisial nama kampus (misal: "ITS Surabaya" -> "ITS")
    const words = name.split(' ');
    if (words[0] === 'UIN' || words[0] === 'UPN' || words[0] === 'UM' || words[0] === 'UB') {
      return words.slice(0, 2).join('');
    }
    return words[0];
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Aktif': return 'badge-active';
      case 'Kurang Aktif': return 'badge-warning';
      case 'Perlu Tindak Lanjut': return 'badge-danger';
      default: return 'badge-bps';
    }
  };

  // List of regions in East Java BPS
  const regions = ["All", "Surabaya Metropolitan", "Malang Raya", "Tapal Kuda", "Mataraman", "Madura"];

  return (
    <div className="potik-list-view animate-fade-in">
      {/* Title */}
      <div className="list-header">
        <h1 className="text-gradient-bps">Katalog Pojok Statistik</h1>
        <p className="subtitle">Daftar lengkap 57 Pojok Statistik perguruan tinggi mitra BPS Jawa Timur</p>
      </div>

      {/* Search & Filters */}
      <div className="filters-panel glass-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama kampus, universitas, atau kota..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
          />
        </div>

        <div className="filter-dropdowns">
          <div className="filter-item">
            <label><Filter size={12} /> Wilayah Geografis</label>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="input-control select-control"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r === 'All' ? 'Semua Wilayah' : r}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label><TrendingUp size={12} /> Status Keaktifan</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-control select-control"
            >
              <option value="All">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Kurang Aktif">Kurang Aktif</option>
              <option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info flex-between">
        <p>Menampilkan <b>{filteredPotiks.length}</b> dari <b>{potiks.length}</b> Pojok Statistik</p>
        {(search || selectedRegion !== "All" || selectedStatus !== "All") && (
          <button 
            className="btn-clear-filters"
            onClick={() => {
              setSearch("");
              setSelectedRegion("All");
              setSelectedStatus("All");
            }}
          >
            Bersihkan Filter
          </button>
        )}
      </div>

      {/* Universities Grid */}
      <div className="grid-3 potiks-grid">
        {filteredPotiks.map((uni) => (
          <div 
            key={uni.id} 
            className="glass-card glass-card-interactive potik-card"
            onClick={() => onSelectPotik(uni.id)}
          >
            {/* Card Header */}
            <div className="card-header-top flex-between">
              <span className="uni-city flex-gap-2">
                <MapPin size={12} /> {uni.city}
              </span>
              <span className={`badge ${getStatusClass(uni.status)}`}>
                {uni.status}
              </span>
            </div>

            {/* University Logo & Names */}
            <div className="card-profile">
              <div 
                className={`uni-logo-avatar ${uni.region.replace(/\s+/g, '-').toLowerCase()}`} 
                style={{ 
                  overflow: 'hidden', 
                  padding: uni.logo ? '4px' : '0', 
                  background: uni.logo ? '#ffffff' : undefined, 
                  border: uni.logo ? '1px solid var(--border-color)' : undefined 
                }}
              >
                {uni.logo ? (
                  <img 
                    src={uni.logo} 
                    alt={uni.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // Fallback ke inisial teks jika gagal loading logo
                      e.target.parentElement.innerHTML = getLogoPlaceholder(uni.name);
                    }}
                  />
                ) : (
                  getLogoPlaceholder(uni.name)
                )}
              </div>
              <div className="uni-titles">
                <h3>{uni.name}</h3>
                <p className="full-name">{uni.university}</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="card-stats">
              <div className="stat-icon-item" title="Infografis">
                <FileText size={16} className="color-infografis" />
                <span className="count-val">{uni.contentsCount.infografis}</span>
              </div>
              <div className="stat-icon-item" title="Video Edukasi">
                <Video size={16} className="color-video" />
                <span className="count-val">{uni.contentsCount.video}</span>
              </div>
              <div className="stat-icon-item" title="Edukasi Statistik">
                <BookOpen size={16} className="color-edukasi" />
                <span className="count-val">{uni.contentsCount.edukasi}</span>
              </div>
              <div className="stat-icon-item" title="Kegiatan Lainnya">
                <Users size={16} className="color-kegiatan" />
                <span className="count-val">{uni.contentsCount.kegiatan}</span>
              </div>
            </div>

            {/* Engagement Score */}
            <div className="card-score-bar">
              <div className="flex-between score-label">
                <span>Skor Keaktifan</span>
                <span className="score-val" style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{uni.engagementScore} / 100</span>
              </div>
              <div className="score-progress-bg">
                <div 
                  className={`score-progress-fill ${uni.engagementScore > 75 ? 'high' : uni.engagementScore > 40 ? 'mid' : 'low'}`}
                  style={{ width: `${uni.engagementScore}%` }}
                ></div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="card-footer-action flex-between">
              <span className="mou-date">MoU: {uni.mou}</span>
              <span className="action-link flex-gap-2">
                Lihat Detail <ArrowRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredPotiks.length === 0 && (
        <div className="glass-card empty-state flex-center">
          <p>Tidak ada Pojok Statistik yang sesuai dengan kriteria pencarian Anda.</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .potik-list-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .list-header .subtitle {
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .filters-panel {
          display: flex;
          gap: 1.5rem;
          padding: 1.25rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-box input {
          width: 100%;
          padding-left: 2.75rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .filter-dropdowns {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .filter-item label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .select-control {
          background-position: right 10px center;
          padding-right: 2rem;
          cursor: pointer;
        }

        .results-info {
          font-size: 0.85rem;
          color: var(--text-secondary);
          padding: 0 0.5rem;
        }

        .btn-clear-filters {
          background: transparent;
          border: none;
          color: var(--color-danger);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-clear-filters:hover {
          text-decoration: underline;
        }

        /* Potik Cards Styling */
        .potik-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.25rem;
        }

        .card-header-top {
          font-size: 0.75rem;
        }

        .uni-city {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .card-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .uni-logo-avatar {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 0.95rem;
          color: #ffffff;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }

        /* Color Coding avatar based on geographic regions */
        .uni-logo-avatar.surabaya-metropolitan { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); }
        .uni-logo-avatar.malang-raya { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); }
        .uni-logo-avatar.tapal-kuda { background: linear-gradient(135deg, #10b981 0%, #047857 100%); }
        .uni-logo-avatar.mataraman { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
        .uni-logo-avatar.madura { background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); }

        .uni-titles h3 {
          font-size: 0.95rem;
          line-height: 1.2;
          margin-bottom: 0.15rem;
        }

        .uni-titles .full-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem;
        }

        .stat-icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          border-right: 1px solid var(--border-color);
        }

        .stat-icon-item:last-child {
          border-right: none;
        }

        .stat-icon-item .count-val {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .color-infografis { color: var(--bps-blue-light); }
        .color-video { color: var(--color-warning); }
        .color-edukasi { color: var(--color-info); }
        .color-kegiatan { color: var(--color-success); }

        .card-score-bar {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .score-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .score-label .score-val {
          font-weight: 700;
          color: #ffffff;
        }

        .score-progress-bg {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .score-progress-fill {
          height: 100%;
          border-radius: 3px;
        }

        .score-progress-fill.high { background: linear-gradient(90deg, #10b981 0%, #059669 100%); }
        .score-progress-fill.mid { background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%); }
        .score-progress-fill.low { background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%); }

        .card-footer-action {
          font-size: 0.7rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          color: var(--text-secondary);
        }

        .action-link {
          font-weight: 600;
          color: var(--bps-blue-light);
          transition: var(--transition-fast);
        }

        .potik-card:hover .action-link {
          color: var(--bps-blue);
          transform: translateX(2px);
        }

        .empty-state {
          height: 200px;
          color: var(--text-secondary);
        }
      `}} />
    </div>
  );
}
