import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Trophy, 
  Terminal, 
  RefreshCw, 
  CheckCircle,
  Database,
  ChevronLeft,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import { getScraperLogs } from '../data/apiClient';
import logoPotik from '../assets/logo_pojok_statistik.svg';

export default function Sidebar({ activeTab, setActiveTab, onResetDb, isCollapsed, onToggleCollapse }) {
  const [lastScrapeTime, setLastScrapeTime] = useState("");
  const [scraperLogsCount, setScraperLogsCount] = useState(0);

  // Perbarui status scraper berdasarkan log terbaru
  const updateScraperStatus = async () => {
    const logs = await getScraperLogs();
    setScraperLogsCount(logs.length);
    const successLogs = logs.filter(l => l.type === 'success');
    if (successLogs.length > 0) {
      // Ambil waktu dari log sukses terbaru
      const latestTime = successLogs[0].timestamp.split(' ')[1] || "";
      setLastScrapeTime(latestTime);
    }
  };

  useEffect(() => {
    updateScraperStatus();

    // Dengarkan jika ada event update log
    window.addEventListener("bps_potik_logs_updated", updateScraperStatus);
    return () => {
      window.removeEventListener("bps_potik_logs_updated", updateScraperStatus);
    };
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'analysis',  label: 'Analysis Insight', icon: BarChart2 },
    { id: 'potik-list', label: 'Daftar Potik',    icon: MapPin },
    { id: 'leaderboard', label: 'Leaderboard',    icon: Trophy },
    { id: 'simulator', label: 'Scraper Simulator', icon: Terminal },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Logo */}
      <div className="sidebar-brand">
        <img src={logoPotik} alt="Logo Pojok Statistik" className="brand-logo" />
        <div className="brand-text">
          <h2>POTIK MONITOR</h2>
          <p>BPS Provinsi Jawa Timur</p>
        </div>
        <button className="btn-collapse" onClick={onToggleCollapse} title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComponent size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Scraper Status Panel */}
      <div className="sidebar-status">
        <div className="status-header">
          <span className="status-indicator-ping"></span>
          <span className="status-title">Scraper Status</span>
        </div>
        <div className="status-body">
          <div className="status-row">
            <span className="label">Daemon:</span>
            <span className="val active">
              <CheckCircle size={12} className="inline-icon" /> ONLINE
            </span>
          </div>
          <div className="status-row">
            <span className="label">Last Sync:</span>
            <span className="val">{lastScrapeTime || "Just Now"}</span>
          </div>
          <div className="status-row">
            <span className="label">Sync Log:</span>
            <span className="val badge-count">{scraperLogsCount} syncs</span>
          </div>
        </div>
      </div>

      {/* Reset Database Button */}
      <div className="sidebar-footer">
        <button className="btn-reset" onClick={onResetDb} title="Reset database ke data awal">
          <RefreshCw size={14} />
          <span>Reset Database</span>
        </button>
      </div>

      {/* Developer Credit */}
      <div className="sidebar-dev-credit">
        <span>Developed by <strong>Anas Wicaksono</strong></span>
        <span>PENS — Politeknik Elektronika Negeri Surabaya</span>
      </div>

      {/* Sidebar specific CSS injected directly or styling class declarations */}
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          z-index: 100;
          transition: width var(--transition-normal), padding var(--transition-normal);
        }

        .btn-collapse {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          margin-left: auto;
          flex-shrink: 0;
        }

        .btn-collapse:hover {
          color: var(--bps-blue);
          border-color: var(--bps-blue-light);
          background: rgba(2, 132, 199, 0.05);
        }

        /* Collapsed Sidebar Styles */
        .sidebar.collapsed {
          width: 80px;
          padding: 1.5rem 0.5rem;
          align-items: center;
        }

        .sidebar.collapsed .sidebar-brand {
          padding: 0.5rem 0 1rem 0;
          justify-content: center;
          width: 100%;
          border-bottom: none;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sidebar.collapsed .brand-logo {
          height: 30px;
        }

        .sidebar.collapsed .btn-collapse {
          margin-left: 0;
        }

        .sidebar.collapsed .brand-text,
        .sidebar.collapsed .status-header,
        .sidebar.collapsed .status-body,
        .sidebar.collapsed .btn-reset span,
        .sidebar.collapsed .sidebar-status {
          display: none;
        }

        .sidebar.collapsed .menu-item {
          justify-content: center;
          padding: 0.85rem;
          border-radius: 50%;
        }

        .sidebar.collapsed .menu-item span {
          display: none;
        }

        .sidebar.collapsed .menu-item.active {
          border-left: none;
          border-radius: 50%;
          background: var(--bps-blue);
          color: #ffffff;
          padding-left: 0.85rem;
        }

        .sidebar.collapsed .btn-reset {
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .btn-collapse {
            display: none !important;
          }
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.25rem 1.5rem 0.25rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }

        .brand-logo {
          height: 38px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }

        .brand-text h2 {
          font-size: 0.95rem;
          letter-spacing: 0.5px;
          margin-bottom: 0.1rem;
          color: var(--text-primary);
        }

        .brand-text p {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--font-heading);
          font-weight: 500;
          text-align: left;
          width: 100%;
          transition: var(--transition-fast);
        }

        .menu-item:hover {
          background: rgba(0, 0, 0, 0.02);
          color: var(--text-primary);
        }

        .menu-item.active {
          background: linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%);
          color: var(--bps-blue);
          border-left: 3px solid var(--bps-blue);
          border-radius: 0 10px 10px 0;
          font-weight: 600;
          padding-left: calc(1rem - 3px);
        }

        .sidebar-status {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.85rem;
          margin-bottom: 1rem;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.4rem;
        }

        .status-indicator-ping {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }

        .status-indicator-ping::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: var(--color-success);
          border-radius: 50%;
          animation: status-ping 1.5s infinite;
        }

        @keyframes status-ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .status-title {
          font-size: 0.75rem;
          font-family: var(--font-heading);
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.75rem;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary);
        }

        .status-row .val {
          font-family: monospace;
          color: var(--text-primary);
        }

        .status-row .val.active {
          color: var(--color-success);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .status-row .val.badge-count {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0 0.4rem;
          border-radius: 4px;
          color: var(--bps-blue);
        }

        .inline-icon {
          display: inline;
        }

        .btn-reset {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.6rem;
          background: transparent;
          border: 1px dashed var(--border-color);
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.75rem;
          font-family: var(--font-heading);
          font-weight: 500;
          transition: var(--transition-fast);
        }

        .btn-reset:hover {
          border-color: var(--color-danger);
          color: var(--color-danger);
          background: rgba(239, 68, 68, 0.05);
        }

        .sidebar-dev-credit {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0.65rem 0.5rem 0.2rem;
          gap: 0.15rem;
          border-top: 1px solid var(--border-color);
          margin-top: 0.5rem;
        }

        .sidebar-dev-credit span {
          font-size: 0.6rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .sidebar-dev-credit strong {
          color: var(--text-secondary);
          font-weight: 700;
        }

        .sidebar.collapsed .sidebar-dev-credit {
          display: none;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 80px;
            padding: 1.5rem 0.5rem;
            align-items: center;
          }

          .sidebar-brand {
            padding: 0.5rem 0 1rem 0;
            justify-content: center;
            width: 100%;
            border-bottom: none;
          }

          .brand-logo {
            height: 30px;
          }

          .brand-text, .status-header, .status-body, .btn-reset span, .sidebar-status {
            display: none;
          }

          .menu-item {
            justify-content: center;
            padding: 0.85rem;
            border-radius: 50%;
          }

          .menu-item span {
            display: none;
          }

          .menu-item.active {
            border-left: none;
            border-radius: 50%;
            background: var(--bps-blue);
            color: #ffffff;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            flex-direction: row;
            width: 100%;
            height: 4.5rem;
            bottom: auto;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 1rem;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
          }

          .sidebar-brand {
            border-bottom: none;
            margin-bottom: 0;
            padding: 0;
            width: auto;
          }

          .brand-logo {
            height: 32px;
          }

          .brand-text {
            display: block;
          }

          .brand-text h2 {
            font-size: 0.95rem;
          }

          .brand-text p {
            display: none;
          }

          .sidebar-menu {
            flex-direction: row;
            gap: 0.5rem;
            flex: none;
          }

          .menu-item {
            width: auto;
            border-radius: 8px;
            padding: 0.5rem;
          }

          .menu-item.active {
            border-radius: 8px;
            background: rgba(2, 132, 199, 0.1);
            color: var(--bps-blue);
          }

          .sidebar-footer {
            display: none;
          }
        }
      `}} />
    </aside>
  );
}
