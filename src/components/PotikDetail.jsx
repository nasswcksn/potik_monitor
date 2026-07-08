import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  TrendingUp, 
  FileText, 
  Video, 
  BookOpen, 
  Users, 
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  X,
  Mail
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Legend
} from 'recharts';
import { fetchPotikDetail, fetchDatatable } from '../data/apiClient';

export default function PotikDetail({ potikId, onBack }) {
  const [potik, setPotik] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("infografis");
  
  // States untuk DataTable
  const [tableData, setTableData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [start, setStart] = useState(0);
  const [length] = useState(5); // 5 Baris per halaman
  const [isLoading, setIsLoading] = useState(false);

  // Lightbox modal state
  const [selectedMedia, setSelectedMedia] = useState(null);

  const loadDetail = async () => {
    try {
      const data = await fetchPotikDetail(potikId);
      setPotik(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTableData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchDatatable(activeSubTab, potikId, 1, start, length, search);
      setTableData(res.data);
      setTotalRecords(res.recordsFiltered);
    } catch (err) {
      console.error("Error loading table data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleDbUpdate = () => {
      loadDetail();
      loadTableData();
    };
    loadDetail();
    // Dengarkan jika ada event update data
    window.addEventListener("bps_potik_db_updated", handleDbUpdate);
    return () => {
      window.removeEventListener("bps_potik_db_updated", handleDbUpdate);
    };
  }, [potikId, activeSubTab, start, search]);

  useEffect(() => {
    setStart(0); // Reset ke page 1 jika tab/pencarian berubah
    loadTableData();
  }, [activeSubTab, search, potikId]);

  useEffect(() => {
    loadTableData();
  }, [start]);

  if (!potik) {
    return <div className="glass-card flex-center empty-state">Memuat data detail...</div>;
  }

  // Radar Chart Data - Perbandingan dengan Rata-rata Ideal BPS
  const chartData = [
    { subject: 'Infografis', Kampus: potik.contentsCount.infografis, Target: 12 },
    { subject: 'Video', Kampus: potik.contentsCount.video, Target: 6 },
    { subject: 'Edukasi', Kampus: potik.contentsCount.edukasi, Target: 10 },
    { subject: 'Kegiatan', Kampus: potik.contentsCount.kegiatan, Target: 5 }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Aktif': return 'badge-active';
      case 'Kurang Aktif': return 'badge-warning';
      case 'Perlu Tindak Lanjut': return 'badge-danger';
      default: return 'badge-bps';
    }
  };

  const handlePrevPage = () => {
    if (start - length >= 0) setStart(start - length);
  };

  const handleNextPage = () => {
    if (start + length < totalRecords) setStart(start + length);
  };

  const currentPage = Math.floor(start / length) + 1;
  const totalPages = Math.ceil(totalRecords / length) || 1;

  return (
    <div className="potik-detail-view animate-fade-in">
      {/* Back Button */}
      <button className="btn btn-secondary btn-back flex-gap-2" onClick={onBack}>
        <ArrowLeft size={16} /> Kembali ke Katalog
      </button>

      {/* Profile Header */}
      <div className="detail-profile-header glass-card">
        <div className="profile-header-layout" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {potik.logo && (
            <div className="detail-uni-logo" style={{ width: '56px', height: '56px', padding: '4px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={potik.logo} alt={potik.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div className="profile-top" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h1 className="text-gradient-bps" style={{ margin: 0, fontSize: '1.6rem' }}>{potik.name}</h1>
              <span className={`badge ${getStatusClass(potik.status)}`}>{potik.status}</span>
            </div>
            <p className="subtitle" style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{potik.university}</p>
          </div>
        </div>
        
        <div className="profile-info-grid">
          <div className="info-item flex-gap-2">
            <MapPin size={16} className="icon-blue" />
            <span>Kab/Kota: <b>{potik.city} ({potik.region})</b></span>
          </div>
          <div className="info-item flex-gap-2">
            <Calendar size={16} className="icon-blue" />
            <span>Mulai Kerja Sama: <b>{potik.mou}</b></span>
          </div>
          <div className="info-item flex-gap-2">
            <User size={16} className="icon-blue" />
            <span>Pengelola: <b>{potik.contact.split('(')[0].trim()}</b></span>
          </div>
          <div className="info-item flex-gap-2">
            <Phone size={16} className="icon-blue" />
            <span>Kontak: <b>{potik.contact.substring(potik.contact.indexOf('('))}</b></span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-detail-layout">
        {/* Left Side: Stats & Charts */}
        <div className="detail-left-column">
          {/* Stats Breakdown Card */}
          <div className="glass-card stat-summary-card">
            <h3>Ringkasan Aktivitas</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="label flex-gap-2"><FileText size={14} className="color-infografis" /> Infografis</span>
                <span className="val">{potik.contentsCount.infografis}</span>
              </div>
              <div className="stat-row">
                <span className="label flex-gap-2"><Video size={14} className="color-video" /> Video Edukasi</span>
                <span className="val">{potik.contentsCount.video}</span>
              </div>
              <div className="stat-row">
                <span className="label flex-gap-2"><BookOpen size={14} className="color-edukasi" /> Edukasi Statistik</span>
                <span className="val">{potik.contentsCount.edukasi}</span>
              </div>
              <div className="stat-row">
                <span className="label flex-gap-2"><Users size={14} className="color-kegiatan" /> Kegiatan Mitra</span>
                <span className="val">{potik.contentsCount.kegiatan}</span>
              </div>
              <div className="stat-row border-top-glow">
                <span className="label flex-gap-2 font-bold"><TrendingUp size={14} className="icon-blue" /> Skor Keaktifan</span>
                <span className="val font-bold text-gradient-bps">{potik.engagementScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="glass-card chart-card">
            <h3>Peta Komposisi Konten</h3>
            <p className="chart-sub text-muted">Dibandingkan dengan standar keaktifan BPS Jatim</p>
            <div className="chart-container-detail">
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart cx="50%" cy="50%" radius="70%" data={chartData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 15]} tick={{ fill: 'var(--text-muted)' }} />
                  <Radar name="Kampus" dataKey="Kampus" stroke="var(--bps-blue-light)" fill="var(--bps-blue)" fillOpacity={0.25} />
                  <Radar name="Target BPS" dataKey="Target" stroke="var(--bps-orange-light)" fill="var(--bps-orange)" fillOpacity={0.05} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-primary)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: DataTables Panel */}
        <div className="detail-right-column glass-card">
          {/* Sub-Tabs Nav */}
          <div className="datatable-tabs border-bottom flex-between flex-wrap gap-2">
            <div className="tabs-buttons flex-gap-2">
              <button 
                className={`tab-btn flex-gap-2 ${activeSubTab === "infografis" ? "active" : ""}`}
                onClick={() => setActiveSubTab("infografis")}
              >
                <FileText size={16} /> Infografis
              </button>
              <button 
                className={`tab-btn flex-gap-2 ${activeSubTab === "video" ? "active" : ""}`}
                onClick={() => setActiveSubTab("video")}
              >
                <Video size={16} /> Video
              </button>
              <button 
                className={`tab-btn flex-gap-2 ${activeSubTab === "edukasi" ? "active" : ""}`}
                onClick={() => setActiveSubTab("edukasi")}
              >
                <BookOpen size={16} /> Edukasi
              </button>
              <button 
                className={`tab-btn flex-gap-2 ${activeSubTab === "kegiatan" ? "active" : ""}`}
                onClick={() => setActiveSubTab("kegiatan")}
              >
                <Users size={16} /> Kegiatan
              </button>
            </div>
            
            {/* Search Input */}
            <div className="table-search">
              <Search size={14} className="search-icon-sm" />
              <input 
                type="text" 
                placeholder="Cari konten..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-control input-sm"
              />
            </div>
          </div>

          {/* DataTable Content */}
          <div className="datatable-wrapper">
            {isLoading ? (
              <div className="loading-overlay flex-center">Memuat Data...</div>
            ) : tableData.length === 0 ? (
              <div className="empty-table flex-center">Tidak ada data ditemukan</div>
            ) : (
              <div className="table-rows">
                {tableData.map((item) => (
                  <div key={item.id} className="catalog-card">

                    {/* Row 1: thumbnail (infografis only) + main content */}
                    <div className="catalog-card__body">

                      {/* Thumbnail — infografis only */}
                      {activeSubTab === "infografis" && item.thumbnail && (
                        <div className="catalog-thumb" onClick={() => setSelectedMedia(item)}>
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://picsum.photos/400/300?random=${item.id}`;
                            }}
                          />
                          <div className="catalog-thumb__overlay"><Eye size={16} /></div>
                        </div>
                      )}

                      {/* Right: all text */}
                      <div className="catalog-card__content">

                        {/* Title + badge baris 1 */}
                        <div className="catalog-card__title-row">
                          <h4 className="catalog-card__title" onClick={() => setSelectedMedia(item)}>
                            {item.name}
                          </h4>
                          <div className="catalog-card__badges">
                            <div dangerouslySetInnerHTML={{ __html: item.penyusun_badge }} />
                            {item.type && <span className="badge badge-bps">{item.type}</span>}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="catalog-card__desc">{item.description}</p>

                        {/* Meta footer */}
                        <div className="catalog-card__footer">
                          {/* Kiri: penulis + email */}
                          <div className="catalog-card__meta-left">
                            <span className="meta-item">
                              <User size={11} />
                              <span>{item.author_name}</span>
                            </span>
                            {item.agen && (
                              <span className="author-email-badge">
                                <Mail size={10} />{item.agen}
                              </span>
                            )}
                          </div>
                          {/* Kanan: views, likes, tanggal */}
                          <div className="catalog-card__meta-right">
                            <span className="meta-item"><Eye size={11} />{item.views_count}</span>
                            <span className="meta-item"><Heart size={11} />{item.likes_count}</span>
                            <span className="meta-item"><Calendar size={11} /><b>{item.created_at ? item.created_at.split(' ')[0] : '-'}</b></span>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DataTable Pagination */}
          {totalRecords > 0 && (
            <div className="datatable-pagination flex-between border-top">
              <span className="pagination-info">
                Menampilkan <b>{start + 1}</b> - <b>{Math.min(start + length, totalRecords)}</b> dari <b>{totalRecords}</b> data
              </span>
              <div className="pagination-buttons flex-gap-2">
                <button 
                  className="btn btn-secondary btn-pagination" 
                  onClick={handlePrevPage} 
                  disabled={start === 0}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="page-number">Page {currentPage} of {totalPages}</span>
                <button 
                  className="btn btn-secondary btn-pagination" 
                  onClick={handleNextPage} 
                  disabled={start + length >= totalRecords}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Media Viewer Modal */}
      {selectedMedia && (
        <div className="media-modal-overlay flex-center animate-fade-in" onClick={() => setSelectedMedia(null)}>
          <div className="media-modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setSelectedMedia(null)}>
              <X size={20} />
            </button>
            <div className="modal-body-layout">
              <div className="modal-preview">
                {activeSubTab === 'video' ? (
                  <iframe 
                    width="100%" 
                    height="315" 
                    src={selectedMedia.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img 
                    src={selectedMedia.thumbnail} 
                    alt={selectedMedia.name} 
                    className="modal-img" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://picsum.photos/400/300?random=${selectedMedia.id}`;
                    }}
                  />
                )}
              </div>
              <div className="modal-info">
                <span className="date">{selectedMedia.created_at}</span>
                <h2>{selectedMedia.name}</h2>
                <div className="badges flex-gap-2" style={{ margin: '0.5rem 0' }}>
                  <div dangerouslySetInnerHTML={{ __html: selectedMedia.penyusun_badge }}></div>
                  {selectedMedia.type && <span className="badge badge-bps">{selectedMedia.type}</span>}
                </div>
                <p className="desc">{selectedMedia.description}</p>
                <div className="meta-footer border-top">
                  <p>Penulis: <b>{selectedMedia.author_name}</b></p>
                  {selectedMedia.agen && <p>Email: <b>{selectedMedia.agen}</b></p>}
                  <div className="stats flex-gap-3" style={{ marginTop: '0.5rem' }}>
                    <span className="flex-gap-1"><Eye size={14} /> {selectedMedia.views_count} Views</span>
                    <span className="flex-gap-1"><Heart size={14} /> {selectedMedia.likes_count} Likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .potik-detail-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .btn-back {
          align-self: flex-start;
        }

        .detail-profile-header {
          padding: 1.5rem;
        }

        .detail-profile-header .profile-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .detail-profile-header h1 {
          font-size: 1.6rem;
          margin: 0;
        }

        .detail-profile-header .subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
        }

        .profile-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        @media (max-width: 600px) {
          .profile-info-grid {
            grid-template-columns: 1fr;
          }
        }

        .info-item {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .icon-blue {
          color: var(--bps-blue);
        }

        /* Detail Layout Grid */
        .grid-detail-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 950px) {
          .grid-detail-layout {
            grid-template-columns: 1fr;
          }
        }

        .detail-left-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stat-summary-card {
          padding: 1.25rem;
        }

        .stat-summary-card h3, .chart-card h3 {
          font-size: 1.05rem;
          margin-bottom: 1rem;
        }

        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stats-list .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .stats-list .stat-row .val {
          font-weight: 700;
          color: var(--text-primary);
        }

        .border-top-glow {
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          margin-top: 0.25rem;
        }

        .font-bold {
          font-weight: 700 !important;
        }

        .chart-card {
          padding: 1.25rem;
        }

        .chart-sub {
          font-size: 0.75rem;
          margin-top: -0.85rem;
          margin-bottom: 1rem;
        }

        .chart-container-detail {
          margin-left: -15px;
        }

        /* DataTable Right Column */
        .detail-right-column {
          padding: 1.5rem;
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .datatable-tabs {
          padding-bottom: 1rem;
        }

        .tabs-buttons {
          overflow-x: auto;
        }

        .tab-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.85rem;
          transition: var(--transition-fast);
        }

        .tab-btn:hover {
          color: var(--bps-blue);
          background: rgba(0, 0, 0, 0.02);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(234, 88, 12, 0.02) 100%);
          color: var(--bps-blue);
          border-color: var(--border-color);
        }

        .table-search {
          position: relative;
        }

        .search-icon-sm {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .input-sm {
          padding: 0.45rem 0.75rem 0.45rem 2rem;
          font-size: 0.8rem;
          border-radius: 6px;
          width: 180px;
        }

        .datatable-wrapper {
          flex: 1;
          margin-top: 1rem;
          position: relative;
        }

        .loading-overlay, .empty-table {
          height: 300px;
          color: var(--text-secondary);
        }

        /* === CATALOG CARDS === */

        .table-rows {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .catalog-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .catalog-card:hover {
          border-color: rgba(2, 132, 199, 0.3);
          box-shadow: 0 2px 12px rgba(2, 132, 199, 0.06);
        }

        /* Body = thumbnail | content */
        .catalog-card__body {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        /* Thumbnail */
        .catalog-thumb {
          flex-shrink: 0;
          width: 88px;
          height: 116px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }

        .catalog-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.25s;
        }

        .catalog-thumb:hover img {
          transform: scale(1.06);
        }

        .catalog-thumb__overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.42);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .catalog-thumb:hover .catalog-thumb__overlay {
          opacity: 1;
        }

        /* Content column */
        .catalog-card__content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        /* Title row */
        .catalog-card__title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .catalog-card__title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
          cursor: pointer;
          flex: 1;
          min-width: 0;
        }

        .catalog-card__title:hover {
          color: var(--bps-blue);
        }

        .catalog-card__badges {
          display: flex;
          flex-wrap: nowrap;
          gap: 0.4rem;
          align-items: center;
          flex-shrink: 0;
        }

        /* Description */
        .catalog-card__desc {
          font-size: 0.76rem;
          color: var(--text-secondary);
          line-height: 1.55;
          /* clamp to 3 lines max to keep cards uniform */
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Footer */
        .catalog-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.4rem;
          padding-top: 0.6rem;
          border-top: 1px solid var(--border-color);
        }

        .catalog-card__meta-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .catalog-card__meta-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .meta-item b {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .author-email-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 2px 8px;
          border-radius: 10px;
          background: rgba(2, 132, 199, 0.08);
          color: #0369a1;
          font-size: 0.66rem;
          font-weight: 600;
          border: 1px solid rgba(2, 132, 199, 0.15);
          white-space: nowrap;
        }

        /* === PAGINATION === */
        .datatable-pagination {

          margin-top: 1.5rem;
          padding-top: 1rem;
          font-size: 0.75rem;
        }

        .pagination-info {
          color: var(--text-secondary);
        }

        .btn-pagination {
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
        }

        .page-number {
          color: var(--text-primary);
          align-self: center;
        }

        /* Modal Overlay Lightbox */
        .media-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          padding: 2rem;
        }

        .media-modal-content {
          width: 850px;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 1.5rem;
          background: var(--bg-secondary);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }

        .btn-close-modal {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
        }

        .btn-close-modal:hover {
          color: var(--bps-blue);
          background: var(--border-color);
        }

        .modal-body-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        @media (max-width: 750px) {
          .modal-body-layout {
            grid-template-columns: 1fr;
          }
        }

        .modal-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .modal-img {
          max-width: 100%;
          max-height: 450px;
          object-fit: contain;
        }

        .modal-info {
          display: flex;
          flex-direction: column;
        }

        .modal-info .date {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .modal-info h2 {
          font-size: 1.25rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .modal-info .desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
          flex: 1;
          margin-top: 0.5rem;
        }

        .modal-info .meta-footer {
          margin-top: 1.5rem;
          padding-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          border-top: 1px solid var(--border-color);
        }
        
        .author-email-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 12px;
          background: rgba(2, 132, 199, 0.08);
          color: var(--bps-blue);
          font-size: 0.65rem;
          font-weight: 600;
          border: 1px solid rgba(2, 132, 199, 0.15);
        }
      `}} />
    </div>
  );
}
