import { useState, useEffect, useMemo } from 'react';
import { getLocalUser, setLocalUser, getLocalMissions, saveLocalMissions } from './lib/storage';
import { Mission, MissionStats, LocalUser } from './types';
import { Dashboard } from './components/Dashboard';
import { MissionTable } from './components/MissionTable';
import { MissionForm } from './components/MissionForm';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import { StatsCharts } from './components/StatsCharts';
import { ExcelImport } from './components/ExcelImport';
import { Plus, LogOut, ChevronRight, LayoutDashboard, Database, Info, FileSpreadsheet, AlertTriangle, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [missionToDelete, setMissionToDelete] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'sinistre' | 'assure'>('date');
  const [view, setView] = useState<'missions' | 'analytics'>('missions');

  // Auth & Data Initialization
  useEffect(() => {
    const storedUser = getLocalUser();
    const storedMissions = getLocalMissions();
    
    if (storedUser) {
      setUser(storedUser);
      setMissions(storedMissions);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    if (name.trim()) {
      const newUser: LocalUser = {
        id: 'local-user-' + Date.now(),
        email: name.trim() + '@local',
        name: name.trim()
      };
      setUser(newUser);
      setLocalUser(newUser);
      setMissions(getLocalMissions());
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLocalUser(null);
    setMissions([]);
  };

  // Derived Stats
  const stats = useMemo<MissionStats>(() => {
    const gp = missions.filter(m => m.type === 'GP').length;
    const sad = missions.filter(m => m.type === 'SAD').length;
    const cc = missions.filter(m => m.type === 'CC').length;
    const sadAuto = missions.filter(m => m.type === 'SAD auto').length;
    const gag = missions.filter(m => m.type === 'GAG').length;
    
    const totalGP = gp + sad;
    const eligibleTotal = gp + sad + cc;
    const total = missions.length;
    const taux = eligibleTotal > 0 ? totalGP / eligibleTotal : 0;

    return { gp, sad, cc, sadAuto, gag, totalGP, total, taux };
  }, [missions]);

  // Search, Filter and Sort
  const filteredMissions = useMemo(() => {
    let result = missions;

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(m => 
        m.sinistre.toLowerCase().includes(s) ||
        m.assure.toLowerCase().includes(s) ||
        m.observations.toLowerCase().includes(s)
      );
    }

    if (filterType !== 'all') {
      result = result.filter(m => m.type === filterType);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.dateMission || 0).getTime();
        const dateB = new Date(b.dateMission || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'sinistre') {
        return a.sinistre.localeCompare(b.sinistre);
      }
      if (sortBy === 'assure') {
        return a.assure.localeCompare(b.assure);
      }
      return 0;
    });

    return result;
  }, [missions, search, filterType, sortBy]);

  const handleCreateOrUpdate = (data: Partial<Mission>) => {
    if (!user) return;

    let updatedMissions: Mission[];
    const now = new Date().toISOString();

    if (editingMission) {
      updatedMissions = missions.map(m => 
        m.id === editingMission.id 
          ? { ...m, ...data, updatedAt: now } as Mission
          : m
      );
    } else {
      const newMission: Mission = {
        ...data,
        id: 'mission-' + Date.now(),
        createdAt: now,
        updatedAt: now,
        createdBy: user.id,
        dateMission: data.dateMission || now,
      } as Mission;
      updatedMissions = [newMission, ...missions];
    }

    setMissions(updatedMissions);
    saveLocalMissions(updatedMissions);
    setIsFormOpen(false);
    setEditingMission(null);
  };

  const handleDelete = () => {
    if (!missionToDelete) return;
    const updatedMissions = missions.filter(m => m.id !== missionToDelete);
    setMissions(updatedMissions);
    saveLocalMissions(updatedMissions);
    setMissionToDelete(null);
  };

  const handleResetAll = () => {
    setMissions([]);
    saveLocalMissions([]);
    setIsResetConfirmOpen(false);
  };

  const handleBatchImport = (importedMissions: Partial<Mission>[]) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    const newMissions: Mission[] = importedMissions.map((m, index) => ({
      ...m,
      id: `imported-${Date.now()}-${index}`,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      dateMission: m.dateMission || now,
    } as Mission));

    const updatedMissions = [...newMissions, ...missions];
    setMissions(updatedMissions);
    saveLocalMissions(updatedMissions);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] p-4 text-center">
        <div className="max-w-md w-full space-y-8 bg-[#111113] p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-600/20">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white italic">Sinisync</h1>
            <p className="text-gray-500 text-sm leading-relaxed px-4">
              Entrez votre nom pour accéder à votre espace de stockage local.
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                required
                name="name"
                type="text"
                placeholder="Votre Nom ou Identifiant"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all font-bold tracking-tight"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 px-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Accéder au Dashboard
            </button>
          </form>

          <div className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] pt-4">
            Local Persistence Active
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-white">
              Sinisync
            </h1>
            <div className="hidden lg:flex items-center gap-2 border-l border-white/10 ml-6 pl-6">
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.name}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-white/5 p-1 rounded-xl border border-white/5 mx-4">
            <button 
              onClick={() => setView('missions')}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'missions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Dossiers
            </button>
            <button 
              onClick={() => setView('analytics')}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Analyses
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsImportOpen(true)}
              className="p-2.5 bg-white/5 text-gray-400 rounded-xl border border-white/5 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              title="Importer Excel"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">Import Excel</span>
            </button>
            <button 
              onClick={() => {
                setEditingMission(null);
                setIsFormOpen(true);
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau Dossier</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/5 transition-all rounded-xl"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-10">
        {/* Navigation Breadcrumb (Visual only) */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-black">{view === 'missions' ? 'Aperçu Général' : 'Analyses & Statistiques'}</span>
          </div>

          {missions.length > 0 && (
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-black text-red-400 uppercase tracking-widest transition-all glass-effect group"
            >
              <Database className="w-3 h-3 group-hover:rotate-12 transition-transform" />
              Remise à zéro
            </button>
          )}
        </div>

        {/* Dashboard Stats */}
        <Dashboard stats={stats} />

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button 
              onClick={() => {
                setError(null);
                // Force a re-mount by toggling a key or just letting the effect re-run if possible
              }}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center bg-white/5 p-1 rounded-xl border border-white/5 mb-8">
          <button 
            onClick={() => setView('missions')}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'missions' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
          >
            Dossiers
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
          >
            Analyses
          </button>
        </div>

        {view === 'missions' ? (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between px-2">
              <h2 className="text-2xl font-bold tracking-tight text-white italic">
                Flux des Missions
              </h2>
              <span className="text-[10px] text-indigo-400 font-mono tracking-[0.2em]">{missions.length} DOSSIERS ACTIFS</span>
            </div>
            <MissionTable 
              missions={filteredMissions}
              onEdit={(m) => {
                setEditingMission(m);
                setIsFormOpen(true);
              }}
              onDelete={setMissionToDelete}
              search={search}
              setSearch={setSearch}
              filterType={filterType}
              setFilterType={setFilterType}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-baseline justify-between px-2">
              <h2 className="text-2xl font-bold tracking-tight text-white italic">Performances & Tendances</h2>
            </div>
            <StatsCharts missions={missions} />
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-32 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">
          <span>© 2026 SiniSync • Système de Gestion Optimisée</span>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Service Connecté
            </span>
            <span>v2.4.0-dark</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MissionForm 
        isOpen={isFormOpen}
        mission={editingMission}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingMission(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />

      <DeleteConfirmation
        isOpen={!!missionToDelete}
        itemTitle={missions.find(m => m.id === missionToDelete)?.sinistre}
        onConfirm={handleDelete}
        onCancel={() => setMissionToDelete(null)}
      />

      <DeleteConfirmation
        isOpen={isResetConfirmOpen}
        itemTitle="TOUTES LES MISSIONS"
        onConfirm={handleResetAll}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ExcelImport 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleBatchImport}
      />
    </div>
  );
}
