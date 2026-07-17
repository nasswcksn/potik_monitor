import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faFilePdf } from '@fortawesome/free-regular-svg-icons';

const byPrefixAndName = {
  far: {
    'file-excel': faFileExcel,
    'file-pdf': faFilePdf
  }
};

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import {
  FileSpreadsheet,
  FileText,
  Download,
  TrendingUp,
  Filter,
  BarChart2,
  Image,
  Video,
  BookOpen,
  Users,
  RefreshCw
} from 'lucide-react';
import { fetchPotikList } from '../data/apiClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Palet Warna Kategori ──────────────────────────────────────────
const CAT_COLORS = {
  infografis: '#0284c7', // BPS blue
  video:      '#ea580c', // BPS orange
  edukasi:    '#16a34a', // BPS green
  kegiatan:   '#7c3aed', // violet
};

const CAT_LABELS = {
  infografis: 'Infografis',
  video:      'Video',
  edukasi:    'Edukasi',
  kegiatan:   'Kegiatan',
};

// ─── Tooltip Kustom ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 10,
      padding: '0.75rem 1rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      minWidth: 180,
      fontSize: '0.82rem',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.2rem', marginBottom: '0.25rem', color: entry.color }}>
          <span style={{ fontWeight: 600 }}>{CAT_LABELS[entry.dataKey]}</span>
          <span style={{ fontWeight: 700 }}>{entry.value.toLocaleString('id-ID')}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontWeight: 700 }}>
        <span>Total</span>
        <span>{total.toLocaleString('id-ID')}</span>
      </div>
    </div>
  );
};

// ─── Custom X-Axis Tick (Gambar + Teks) ───────────────────────────
const CustomXAxisTick = (props) => {
  const { x, y, payload, chartData } = props;
  const potik = chartData?.find(p => p.name === payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      {potik?.logo && (
        <>
          <rect
            x={-18}
            y={6}
            width={36}
            height={36}
            rx={8}
            fill="#f8fafc"
            stroke="var(--border-color)"
            strokeWidth={1}
          />
          <image
            href={potik.logo}
            x={-12}
            y={12}
            height={24}
            width={24}
          />
        </>
      )}
      <text
        x={0}
        y={potik?.logo ? 58 : 20}
        dy={0}
        textAnchor="middle"
        fill="var(--text-secondary)"
        fontSize={9.5}
        fontWeight={600}
        fontFamily="var(--font-body)"
      >
        {payload.value}
      </text>
    </g>
  );
};

// ─── Komponen Utama ────────────────────────────────────────────────
export default function AnalysisInsight() {
  const [potiks, setPotiks]         = useState([]);
  const [chartData, setChartData]   = useState([]);
  const [summary, setSummary]       = useState({ infografis: 0, video: 0, edukasi: 0, kegiatan: 0, total: 0, active: 0 });
  const [sortBy, setSortBy]         = useState('total_desc');
  const [filterRegion, setFilterRegion] = useState('all');
  const [regions, setRegions]       = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf]     = useState(false);

  // ── Muat data ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchPotikList();
      setPotiks(list);

      // Kumpulkan region unik
      const regionSet = [...new Set(list.map(p => p.region).filter(Boolean))].sort();
      setRegions(regionSet);

      buildChartData(list, sortBy, filterRegion);
    } catch (err) {
      console.error('AnalysisInsight: gagal memuat data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('bps_potik_db_updated', loadData);
    return () => window.removeEventListener('bps_potik_db_updated', loadData);
  }, [loadData]);

  // Re-build chart saat sort/filter berubah
  useEffect(() => {
    if (potiks.length > 0) buildChartData(potiks, sortBy, filterRegion);
  }, [sortBy, filterRegion, potiks]);

  // ── Build data chart ─────────────────────────────────────────────
  const buildChartData = (list, sort, region) => {
    let filtered = region === 'all' ? list : list.filter(p => p.region === region);

    // Kalkulasi total
    const totals = { infografis: 0, video: 0, edukasi: 0, kegiatan: 0, total: 0, active: 0 };
    list.forEach(p => {
      totals.infografis += p.contentsCount?.infografis || 0;
      totals.video      += p.contentsCount?.video      || 0;
      totals.edukasi    += p.contentsCount?.edukasi    || 0;
      totals.kegiatan   += p.contentsCount?.kegiatan   || 0;
      totals.total      += p.contentsCount?.total      || 0;
      if (p.status === 'Aktif') totals.active++;
    });
    setSummary(totals);

    // Sort
    let sorted = [...filtered];
    switch (sort) {
      case 'total_desc':   sorted.sort((a, b) => (b.contentsCount?.total || 0) - (a.contentsCount?.total || 0)); break;
      case 'total_asc':    sorted.sort((a, b) => (a.contentsCount?.total || 0) - (b.contentsCount?.total || 0)); break;
      case 'infografis':   sorted.sort((a, b) => (b.contentsCount?.infografis || 0) - (a.contentsCount?.infografis || 0)); break;
      case 'video':        sorted.sort((a, b) => (b.contentsCount?.video || 0) - (a.contentsCount?.video || 0)); break;
      case 'edukasi':      sorted.sort((a, b) => (b.contentsCount?.edukasi || 0) - (a.contentsCount?.edukasi || 0)); break;
      case 'kegiatan':     sorted.sort((a, b) => (b.contentsCount?.kegiatan || 0) - (a.contentsCount?.kegiatan || 0)); break;
      case 'name':         sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    const data = sorted.map(p => ({
      name: p.name,
      fullName: p.university || p.name,
      city: p.city,
      region: p.region,
      logo: p.logo,
      infografis: p.contentsCount?.infografis || 0,
      video:      p.contentsCount?.video      || 0,
      edukasi:    p.contentsCount?.edukasi    || 0,
      kegiatan:   p.contentsCount?.kegiatan   || 0,
      total:      p.contentsCount?.total      || 0,
      score:      p.engagementScore            || 0,
      status:     p.status                    || '-',
    }));

    setChartData(data);
  };

  // ── Utilitas nama file ──────────────────────────────────────────
  const getFilename = (ext) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}-${pad(now.getMinutes())}`;
    return `PotikMonitor_Export_${date}_${time}.${ext}`;
  };

  // ── Export Excel ────────────────────────────────────────────────
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      // Baris header
      const header = ['No', 'Universitas / Institusi', 'Kota', 'Bakorwil', 'Infografis', 'Video', 'Edukasi', 'Kegiatan', 'Total Konten', 'Engagement Score', 'Status'];

      // Data rows (gunakan semua potik, bukan hanya yang di filter chart)
      let rows = [...potiks].sort((a, b) => a.name.localeCompare(b.name)).map((p, i) => [
        i + 1,
        p.university || p.name,
        p.city || '-',
        p.region || '-',
        p.contentsCount?.infografis || 0,
        p.contentsCount?.video      || 0,
        p.contentsCount?.edukasi    || 0,
        p.contentsCount?.kegiatan   || 0,
        p.contentsCount?.total      || 0,
        p.engagementScore            || 0,
        p.status                    || '-',
      ]);

      // Baris summary di bawah
      rows.push([]);
      rows.push(['', 'TOTAL', '', '',
        summary.infografis, summary.video, summary.edukasi, summary.kegiatan, summary.total, '', ''
      ]);
      rows.push(['', 'Universitas Aktif', '', '', '', '', '', '', '', `${summary.active} dari ${potiks.length}`, '']);

      const wsData = [header, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Lebar kolom
      ws['!cols'] = [
        { wch: 5 }, { wch: 45 }, { wch: 18 }, { wch: 22 },
        { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 14 }, { wch: 18 }, { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Potik Monitor');

      // Sheet ringkasan
      const summarySheet = XLSX.utils.aoa_to_sheet([
        ['Laporan Aktivitas Pojok Statistik BPS Jawa Timur'],
        [],
        ['Kategori', 'Jumlah Konten', 'Persentase'],
        ['Infografis', summary.infografis, `${((summary.infografis / summary.total) * 100).toFixed(1)}%`],
        ['Video',      summary.video,      `${((summary.video      / summary.total) * 100).toFixed(1)}%`],
        ['Edukasi',    summary.edukasi,    `${((summary.edukasi    / summary.total) * 100).toFixed(1)}%`],
        ['Kegiatan',   summary.kegiatan,   `${((summary.kegiatan   / summary.total) * 100).toFixed(1)}%`],
        [],
        ['Total Konten', summary.total],
        ['Total Potik', potiks.length],
        ['Potik Aktif', summary.active],
        [],
        ['Diekspor pada', new Date().toLocaleString('id-ID')],
        ['Dikembangkan oleh', 'Anas Wicaksono — PENS (Politeknik Elektronika Negeri Surabaya)'],
      ]);
      summarySheet['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan');

      XLSX.writeFile(wb, getFilename('xlsx'));
    } catch (err) {
      console.error('Export Excel gagal:', err);
      alert('Export Excel gagal: ' + err.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // ── Export PDF ──────────────────────────────────────────────────
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(2, 132, 199);
      doc.rect(0, 0, pageW, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Laporan Aktivitas Pojok Statistik BPS Jawa Timur', 12, 11.5);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Diekspor: ${new Date().toLocaleString('id-ID')}`, pageW - 12, 11.5, { align: 'right' });

      // Summary boxes
      doc.setTextColor(15, 23, 42);
      const boxes = [
        { label: 'Total Potik',  value: `${potiks.length}` },
        { label: 'Potik Aktif', value: `${summary.active}` },
        { label: 'Total Konten', value: summary.total.toLocaleString('id-ID') },
        { label: 'Infografis',   value: summary.infografis.toLocaleString('id-ID') },
        { label: 'Video',        value: summary.video.toLocaleString('id-ID') },
        { label: 'Edukasi',      value: summary.edukasi.toLocaleString('id-ID') },
        { label: 'Kegiatan',     value: summary.kegiatan.toLocaleString('id-ID') },
      ];
      const boxW = (pageW - 24) / boxes.length;
      boxes.forEach((b, i) => {
        const x = 12 + i * boxW;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, 21, boxW - 2, 14, 2, 2, 'F');
        doc.setFontSize(6);
        doc.setTextColor(71, 85, 105);
        doc.text(b.label, x + (boxW - 2) / 2, 26, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(b.value, x + (boxW - 2) / 2, 32, { align: 'center' });
        doc.setFont('helvetica', 'normal');
      });

      // Tabel data
      const sorted = [...potiks].sort((a, b) => (b.contentsCount?.total || 0) - (a.contentsCount?.total || 0));
      const tableBody = sorted.map((p, i) => [
        i + 1,
        p.name,
        p.city || '-',
        p.region || '-',
        p.contentsCount?.infografis || 0,
        p.contentsCount?.video      || 0,
        p.contentsCount?.edukasi    || 0,
        p.contentsCount?.kegiatan   || 0,
        p.contentsCount?.total      || 0,
        p.engagementScore            || 0,
        p.status                    || '-',
      ]);

      autoTable(doc, {
        startY: 38,
        head: [['No', 'Universitas', 'Kota', 'Bakorwil', 'Infografis', 'Video', 'Edukasi', 'Kegiatan', 'Total', 'Score', 'Status']],
        body: tableBody,
        styles: { fontSize: 7, cellPadding: 2, font: 'helvetica' },
        headStyles: { fillColor: [2, 132, 199], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 52 },
          2: { cellWidth: 22 },
          3: { cellWidth: 30 },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 14, halign: 'center' },
          6: { cellWidth: 14, halign: 'center' },
          7: { cellWidth: 16, halign: 'center' },
          8: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
          9: { cellWidth: 13, halign: 'center' },
          10: { cellWidth: 22, halign: 'center' },
        },
        didParseCell: (data) => {
          if (data.column.index === 10 && data.section === 'body') {
            const val = data.cell.raw;
            if (val === 'Aktif')             { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = 'bold'; }
            else if (val === 'Kurang Aktif') { data.cell.styles.textColor = [234, 88, 12]; }
            else                             { data.cell.styles.textColor = [239, 68, 68]; }
          }
          // Warna kolom konten
          if ([4,5,6,7].includes(data.column.index) && data.section === 'body') {
            const v = Number(data.cell.raw);
            if (v === 0) data.cell.styles.textColor = [148, 163, 184];
          }
        },
        foot: [['', 'TOTAL', '', '',
          summary.infografis, summary.video, summary.edukasi, summary.kegiatan,
          summary.total, '', '']],
        footStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        margin: { left: 12, right: 12 },
      });

      // Footer halaman
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Halaman ${i} dari ${pageCount}  ·  Dikembangkan oleh Anas Wicaksono — PENS (Politeknik Elektronika Negeri Surabaya)`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 5,
          { align: 'center' }
        );
      }

      doc.save(getFilename('pdf'));
    } catch (err) {
      console.error('Export PDF gagal:', err);
      alert('Export PDF gagal: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ─── Lebar chart dinamis (kolom diperlebar untuk visibilitas) ────
  const COLUMN_WIDTH = 90; // px per universitas
  const chartWidth = Math.max(1200, chartData.length * COLUMN_WIDTH);

  // ─── Render ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '0.75rem', color: 'var(--text-secondary)' }}>
        <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '1rem' }}>Memuat data analisis...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const pct = (v) => summary.total > 0 ? `${((v / summary.total) * 100).toFixed(1)}%` : '0%';

  return (
    <div className="analysis-view animate-fade-in">

      {/* ── Header ── */}
      <div className="flex-between" style={{ marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.7rem', fontFamily: 'var(--font-heading)', fontWeight: 800, background: 'linear-gradient(135deg, var(--bps-blue), var(--bps-orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
            Analysis Insight
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Distribusi konten 4 kategori seluruh Pojok Statistik Jawa Timur
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            id="btn-export-excel"
          >
            {isExportingExcel
              ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
              : <FontAwesomeIcon icon={byPrefixAndName.far['file-excel']} />}
              
            <span>{isExportingExcel ? 'Mengekspor...' : 'Export Excel'}</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            id="btn-export-pdf"
          >
            {isExportingPdf
              ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
              : <FontAwesomeIcon icon={byPrefixAndName.far['file-pdf']} />}
            <span>{isExportingPdf ? 'Membuat PDF...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* ── Summary Legend Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { key: 'infografis', label: 'Infografis', icon: Image,    color: CAT_COLORS.infografis, bg: 'rgba(2,132,199,0.08)',   border: 'rgba(2,132,199,0.2)'  },
          { key: 'video',      label: 'Video',      icon: Video,    color: CAT_COLORS.video,      bg: 'rgba(234,88,12,0.08)',   border: 'rgba(234,88,12,0.2)'  },
          { key: 'edukasi',    label: 'Edukasi',    icon: BookOpen, color: CAT_COLORS.edukasi,    bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)'  },
          { key: 'kegiatan',   label: 'Kegiatan',   icon: Users,    color: CAT_COLORS.kegiatan,   bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.2)' },
        ].map(({ key, label, icon: Icon, color, bg, border }) => (
          <div key={key} className="glass-card" style={{ border: `1px solid ${border}`, background: bg, display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color, lineHeight: 1.1 }}>{summary[key].toLocaleString('id-ID')}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pct(summary[key])} dari total</div>
            </div>
          </div>
        ))}

        {/* Total Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(2,132,199,0.06) 0%, rgba(234,88,12,0.04) 100%)', borderColor: 'rgba(2,132,199,0.2)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--bps-blue), var(--bps-orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Konten</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--bps-blue), var(--bps-orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
              {summary.total.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{summary.active} dari {potiks.length} potik aktif</div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="glass-card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexShrink: 0 }}>
          <Filter size={15} />
          <span style={{ fontWeight: 600 }}>Filter & Urutkan:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>URUTKAN</label>
            <select
              id="sort-analysis"
              className="input-control"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', minWidth: 190 }}
            >
              <option value="total_desc">Total Konten (Terbesar)</option>
              <option value="total_asc">Total Konten (Terkecil)</option>
              <option value="infografis">Infografis</option>
              <option value="video">Video</option>
              <option value="edukasi">Edukasi</option>
              <option value="kegiatan">Kegiatan</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>BAKORWIL</label>
            <select
              id="filter-region-analysis"
              className="input-control"
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', minWidth: 220 }}
            >
              <option value="all">Semua Wilayah</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          Menampilkan <strong style={{ color: 'var(--text-primary)' }}>{chartData.length}</strong> potik
        </div>
      </div>

      {/* ── Chart Container ── */}
      <div className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <BarChart2 size={18} color="var(--bps-blue)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Distribusi Konten per Pojok Statistik
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Scroll samping untuk melihat semua potik →</span>
        </div>

        {/* Legenda warna */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(CAT_COLORS).map(([key, color]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{CAT_LABELS[key]}</span>
            </div>
          ))}
        </div>

        {/* Scroll horizontal — tinggi tetap, lebar chart dinamis */}
        <div style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '0.5rem' }}>
          <div style={{ width: chartWidth, height: 500 }}>
            <BarChart
              width={chartWidth}
              height={500}
              data={chartData}
              margin={{ top: 20, right: 24, left: 0, bottom: 90 }}
              barCategoryGap="20%"
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              
              {/* X-axis bawah: nama kampus dengan logo */}
              <XAxis
                dataKey="name"
                tick={(props) => <CustomXAxisTick {...props} chartData={chartData} />}
                interval={0}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-color)' }}
              />
              
              {/* Y-axis kiri: jumlah konten */}
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(2,132,199,0.04)' }} />
              <Bar dataKey="infografis" name="Infografis" fill={CAT_COLORS.infografis} radius={[0, 0, 0, 0]} maxBarSize={16} />
              <Bar dataKey="video"      name="Video"      fill={CAT_COLORS.video}      radius={[0, 0, 0, 0]} maxBarSize={16} />
              <Bar dataKey="edukasi"    name="Edukasi"    fill={CAT_COLORS.edukasi}    radius={[0, 0, 0, 0]} maxBarSize={16} />
              <Bar dataKey="kegiatan"   name="Kegiatan"   fill={CAT_COLORS.kegiatan}   radius={[0, 0, 0, 0]} maxBarSize={16} />
            </BarChart>
          </div>
        </div>
      </div>

      {/* ── Tabel Ringkasan Teks ── */}
      <div className="glass-card" style={{ marginTop: '1.25rem', padding: '1.25rem 1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Jumlah Konten/Kategori
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {[
            { key: 'infografis', label: 'Total Infografis', color: CAT_COLORS.infografis },
            { key: 'video',      label: 'Total Video Edukasi',      color: CAT_COLORS.video },
            { key: 'edukasi',    label: 'Total Edukasi Statistik',    color: CAT_COLORS.edukasi },
            { key: 'kegiatan',   label: 'Total Kegiatan Lain',   color: CAT_COLORS.kegiatan },
          ].map(({ key, label, color }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.9rem', background: 'var(--bg-tertiary)', borderRadius: 8, borderLeft: `3px solid ${color}` }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{summary[key].toLocaleString('id-ID')}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({pct(summary[key])})</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.75rem 0.9rem', background: 'linear-gradient(135deg, rgba(2,132,199,0.07), rgba(234,88,12,0.04))', borderRadius: 8, border: '1px solid rgba(2,132,199,0.15)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>TOTAL KESELURUHAN</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--bps-blue), var(--bps-orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {summary.total.toLocaleString('id-ID')}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
              dari {potiks.length} Pojok Statistik · Rata-rata {potiks.length > 0 ? Math.round(summary.total / potiks.length) : 0} item/potik
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .analysis-view { animation: fadeIn 0.4s ease; }
      `}</style>
    </div>
  );
}
