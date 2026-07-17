import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PotikList from './components/PotikList';
import PotikDetail from './components/PotikDetail';
import Leaderboard from './components/Leaderboard';
import Simulator from './components/Simulator';
import AnalysisInsight from './components/AnalysisInsight';
import { resetDatabase } from './data/apiClient';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPotikId, setSelectedPotikId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSelectPotik = (id) => {
    setSelectedPotikId(id);
    setActiveTab('potik-detail');
  };

  const handleResetDb = async () => {
    if (window.confirm("Apakah Anda yakin ingin menyetel ulang database monitoring ke kondisi awal? Semua data hasil simulasi scraper akan terhapus.")) {
      await resetDatabase();
      setSelectedPotikId(null);
      setActiveTab('dashboard');
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onSelectPotik={handleSelectPotik} setActiveTab={setActiveTab} />;
      case 'potik-list':
        return <PotikList onSelectPotik={handleSelectPotik} />;
      case 'potik-detail':
        return (
          <PotikDetail 
            potikId={selectedPotikId} 
            onBack={() => setActiveTab(selectedPotikId ? 'potik-list' : 'dashboard')} 
          />
        );
      case 'analysis':
        return <AnalysisInsight />;
      case 'leaderboard':
        return <Leaderboard onSelectPotik={handleSelectPotik} />;
      case 'simulator':
        return <Simulator />;
      default:
        return <Dashboard onSelectPotik={handleSelectPotik} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Jika berpindah tab, bersihkan detail universitas terpilih
          if (tab !== 'potik-detail') {
            setSelectedPotikId(null);
          }
        }} 
        onResetDb={handleResetDb} 
      />

      {/* Main Content Area */}
      <main className="main-content">
        {renderActiveTabContent()}
      </main>
    </div>
  );
}

export default App;
