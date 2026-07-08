import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Search, 
  MapPin, 
  ArrowUpDown, 
  FileText, 
  Video, 
  BookOpen, 
  Users, 
  Star 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchPotikList } from '../data/apiClient';

export default function Leaderboard({ onSelectPotik }) {
  const [potiks, setPotiks] = useState([]);
  const [filteredPotiks, setFilteredPotiks] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("engagementScore");
  const [sortDirection, setSortDirection] = useState("desc");

  const loadData = async () => {
    try {
      const data = await fetchPotikList();
      // Urutkan default berdasarkan score desc. Jika sama, urutkan berdasarkan total publikasi.
      const sorted = [...data].sort((a, b) => {
        if (b.engagementScore !== a.engagementScore) {
          return b.engagementScore - a.engagementScore;
        }
        return b.contentsCount.total - a.contentsCount.total;
      });
      setPotiks(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();

    // Trigger confetti saat tab leaderboard dibuka untuk efek wow
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#ea580c', '#38bdf8', '#ff782b', '#10b981']
    });

    window.addEventListener("bps_potik_db_updated", loadData);
    return () => {
      window.removeEventListener("bps_potik_db_updated", loadData);
    };
  }, []);

  // Filter & Sorting Logic
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

    // Sort logic
    result.sort((a, b) => {
      let valA, valB;

      if (sortField === "name" || sortField === "city" || sortField === "region") {
        valA = a[sortField].toLowerCase();
        valB = b[sortField].toLowerCase();
      } else if (sortField.startsWith("count_")) {
        const type = sortField.split("_")[1];
        valA = a.contentsCount[type];
        valB = b.contentsCount[type];
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      
      // Jika sorting berdasarkan skor tapi seri (contoh: sama-sama 100), gunakan total publikasi sebagai tie-breaker
      if (sortField === "engagementScore") {
        const totalA = a.contentsCount.total || 0;
        const totalB = b.contentsCount.total || 0;
        if (totalA !== totalB) {
          return sortDirection === "asc" ? totalA - totalB : totalB - totalA;
        }
      }
      return 0;
    });

    setFilteredPotiks(result);
  }, [search, sortField, sortDirection, potiks]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Ambil Top 3 untuk Podium
  const top3 = potiks.slice(0, 3);
  // Re-order top 3 ke format visual podium: [Rank 2, Rank 1, Rank 3]
  const podiumData = [];
  if (top3[1]) podiumData.push({ ...top3[1], rank: 2 });
  if (top3[0]) podiumData.push({ ...top3[0], rank: 1 });
  if (top3[2]) podiumData.push({ ...top3[2], rank: 3 });

  return (
    <div className="leaderboard-view animate-fade-in">
      {/* Header */}
      <div className="leaderboard-header">
        <h1 className="text-gradient-bps">Peringkat Keaktifan Potik</h1>
        <p className="subtitle">Leaderboard keaktifan agen dan publikasi Pojok Statistik Jawa Timur</p>
      </div>

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <div className="podium-section flex-center">
          {podiumData.map((uni) => (
            <div 
              key={uni.id} 
              className={`podium-card rank-${uni.rank} glass-card`}
              onClick={() => onSelectPotik(uni.id)}
            >
              <div className="rank-badge-podium">
                <Trophy size={18} />
                <span>Rank {uni.rank}</span>
              </div>
              <div className="avatar-podium" style={{ overflow: 'hidden', padding: uni.logo ? '6px' : '0', background: uni.logo ? '#ffffff' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {uni.logo ? (
                  <img src={uni.logo} alt={uni.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  uni.name.split(' ')[0]
                )}
              </div>
              <h3>{uni.name}</h3>
              <p className="city"><MapPin size={12} className="inline-icon" /> {uni.city}</p>
              
              <div className="podium-score border-top">
                <Star size={14} className="star-icon" />
                <span><b>{uni.engagementScore}</b> Points</span>
              </div>
              
              {/* Composition */}
              <div className="mini-stats flex-center gap-2">
                <span>📊 {uni.contentsCount.infografis}</span>
                <span>🎥 {uni.contentsCount.video}</span>
                <span>📚 {uni.contentsCount.edukasi}</span>
                <span>🤝 {uni.contentsCount.kegiatan}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Section */}
      <div className="glass-card table-section-card">
        <div className="table-header-top flex-between flex-wrap gap-2">
          <h3>Daftar Peringkat Lengkap</h3>
          <div className="table-search">
            <Search size={14} className="search-icon-sm" />
            <input 
              type="text" 
              placeholder="Cari universitas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-control input-sm"
            />
          </div>
        </div>

        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th onClick={() => handleSort("name")} className="sortable">
                  Universitas <ArrowUpDown size={12} className="inline-icon" />
                </th>
                <th onClick={() => handleSort("city")} className="sortable">
                  Kab/Kota <ArrowUpDown size={12} className="inline-icon" />
                </th>
                <th onClick={() => handleSort("region")} className="sortable">
                  Wilayah <ArrowUpDown size={12} className="inline-icon" />
                </th>
                <th onClick={() => handleSort("count_infografis")} className="sortable text-center">
                  <FileText size={14} className="inline-icon color-infografis" /> Inf <ArrowUpDown size={12} className="inline-icon" />
                </th>
                <th onClick={() => handleSort("count_video")} className="sortable text-center">
                  <Video size={14} className="inline-icon color-video" /> Vid <ArrowUpDown size={12} className="inline-icon" />
                </th>
                <th onClick={() => handleSort("count_edukasi")} className="sortable text-center">
                  <BookOpen size={14} className="inline-icon color-edukasi" /> Edu <ArrowUpDown size={12} className="inline-icon" />
                </th>
                <th onClick={() => handleSort("count_kegiatan")} className="sortable text-center">
                  <Users size={14} className="inline-icon color-kegiatan" /> Keg <ArrowUpDown size={12} className="inline-icon" />
                </th>
                <th onClick={() => handleSort("engagementScore")} className="sortable text-center font-bold">
                  Skor Keaktifan <ArrowUpDown size={12} className="inline-icon" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPotiks.map((uni, idx) => {
                // Cari index asli untuk rank aktual
                const originalRank = potiks.findIndex(p => p.id === uni.id) + 1;
                
                return (
                  <tr key={uni.id} onClick={() => onSelectPotik(uni.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span className={`table-rank-badge ${originalRank <= 3 ? `rank-${originalRank}` : ""}`}>
                        {originalRank}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {uni.logo && (
                          <div style={{ width: '28px', height: '28px', padding: '2px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={uni.logo} alt={uni.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                        )}
                        <div>
                          <div className="font-bold">{uni.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{uni.university}</div>
                        </div>
                      </div>
                    </td>
                    <td>{uni.city}</td>
                    <td>{uni.region}</td>
                    <td className="text-center">{uni.contentsCount.infografis}</td>
                    <td className="text-center">{uni.contentsCount.video}</td>
                    <td className="text-center">{uni.contentsCount.edukasi}</td>
                    <td className="text-center">{uni.contentsCount.kegiatan}</td>
                    <td className="text-center font-bold">
                      <span className="score-badge">{uni.engagementScore}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .leaderboard-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .leaderboard-header .subtitle {
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        /* Podium styling */
        .podium-section {
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
          margin: 1rem 0;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .podium-section {
            flex-direction: column;
            align-items: center;
          }
        }

        .podium-card {
          width: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 1rem;
          cursor: pointer;
          position: relative;
        }

        .podium-card.rank-1 {
          height: 300px;
          border-color: #ffd700;
          box-shadow: 0 8px 32px rgba(255, 215, 0, 0.08);
          order: 2;
        }

        .podium-card.rank-2 {
          height: 260px;
          border-color: #c0c0c0;
          box-shadow: 0 8px 32px rgba(192, 192, 192, 0.05);
          order: 1;
        }

        .podium-card.rank-3 {
          height: 240px;
          border-color: #cd7f32;
          box-shadow: 0 8px 32px rgba(205, 127, 50, 0.05);
          order: 3;
        }

        .rank-badge-podium {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .rank-1 .rank-badge-podium { background: rgba(255, 215, 0, 0.15); color: #ffd700; border: 1px solid rgba(255, 215, 0, 0.3); }
        .rank-2 .rank-badge-podium { background: rgba(192, 192, 192, 0.15); color: #c0c0c0; border: 1px solid rgba(192, 192, 192, 0.3); }
        .rank-3 .rank-badge-podium { background: rgba(205, 127, 50, 0.15); color: #cd7f32; border: 1px solid rgba(205, 127, 50, 0.3); }

        .avatar-podium {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1rem;
          color: #ffffff;
          box-shadow: var(--shadow-sm);
          margin-bottom: 0.85rem;
        }

        .rank-1 .avatar-podium { background: linear-gradient(135deg, #ffd700 0%, #cca300 100%); color: #000000; }
        .rank-2 .avatar-podium { background: linear-gradient(135deg, #c0c0c0 0%, #909090 100%); color: #000000; }
        .rank-3 .avatar-podium { background: linear-gradient(135deg, #cd7f32 0%, #995c1e 100%); }

        .podium-card h3 {
          font-size: 0.95rem;
          text-align: center;
          margin-bottom: 0.15rem;
          color: var(--text-primary);
        }

        .podium-card .city {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.85rem;
        }

        .podium-score {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding-top: 0.75rem;
          margin-top: auto;
          font-size: 0.8rem;
          color: var(--text-secondary);
          width: 100%;
          justify-content: center;
        }

        .podium-score b {
          color: var(--text-primary);
          font-size: 1rem;
        }

        .star-icon {
          color: #ffd700;
          fill: #ffd700;
        }

        .podium-card.rank-2 .star-icon { color: #c0c0c0; fill: #c0c0c0; }
        .podium-card.rank-3 .star-icon { color: #cd7f32; fill: #cd7f32; }

        .mini-stats {
          font-size: 0.65rem;
          color: var(--text-secondary);
          margin-top: 0.4rem;
        }

        /* Table section */
        .table-section-card {
          padding: 1.5rem;
        }

        .table-header-top {
          margin-bottom: 1.25rem;
        }

        .sortable {
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .sortable:hover {
          background-color: var(--bg-tertiary) !important;
          color: var(--bps-blue);
        }

        .text-center {
          text-align: center;
        }

        .table-rank-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
        }

        .table-rank-badge.rank-1 { background: #ffd700; color: #000000; }
        .table-rank-badge.rank-2 { background: #c0c0c0; color: #000000; }
        .table-rank-badge.rank-3 { background: #cd7f32; color: #ffffff; }

        .score-badge {
          background: linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%);
          border: 1px solid var(--border-glow);
          color: var(--bps-blue);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          display: inline-block;
        }
      `}} />
    </div>
  );
}
