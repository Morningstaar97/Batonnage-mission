import { Mission } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit2, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface MissionTableProps {
  missions: Mission[];
  onEdit: (mission: Mission) => void;
  onDelete: (id: string) => void;
  search: string;
  setSearch: (s: string) => void;
  filterType: string;
  setFilterType: (t: string) => void;
  sortBy: 'date' | 'sinistre' | 'assure';
  setSortBy: (s: 'date' | 'sinistre' | 'assure') => void;
}

export function MissionTable({ 
  missions, 
  onEdit, 
  onDelete, 
  search, 
  setSearch,
  filterType,
  setFilterType,
  sortBy,
  setSortBy
}: MissionTableProps) {
  return (
    <div className="bg-[#111113] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-4 md:p-6 border-b border-white/5 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white/[0.01]">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 font-bold" />
          <input
            type="text"
            placeholder="Chercher dossier, assuré, observations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10 transition-all placeholder:text-gray-600"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="all" className="bg-[#111113]">Tous les types</option>
            <option value="GP" className="bg-[#111113]">GP</option>
            <option value="CC" className="bg-[#111113]">CC</option>
            <option value="SAD" className="bg-[#111113]">SAD</option>
            <option value="SAD auto" className="bg-[#111113]">SAD auto</option>
            <option value="GAG" className="bg-[#111113]">GAG</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="date" className="bg-[#111113]">Trier par Date</option>
            <option value="sinistre" className="bg-[#111113]">Trier par Dossier</option>
            <option value="assure" className="bg-[#111113]">Trier par Assuré</option>
          </select>

          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono font-bold tracking-widest ml-2">
            <Filter className="w-3 h-3" />
            <span>{missions.length}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-6 col-header w-40">N° Dossier</th>
              <th className="px-6 col-header min-w-[200px]">Assuré</th>
              <th className="px-6 col-header w-24 text-center">Type</th>
              <th className="px-6 col-header w-32 text-center">AR/KYC</th>
              <th className="px-6 col-header">Observations</th>
              <th className="px-6 col-header w-40">Date Mission</th>
              <th className="px-6 col-header w-20 text-right pr-8">•••</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {missions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-gray-600 italic">
                  Aucun dossier trouvé.
                </td>
              </tr>
            ) : (
              missions.map((mission, idx) => (
                <motion.tr
                  key={mission.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="data-row"
                >
                  <td className="px-6 py-5 data-value font-bold text-gray-400">
                    <div className="flex items-center gap-2">
                       {mission.isAlert && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                       {mission.sinistre}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-semibold text-gray-200">{mission.assure}</div>
                    {mission.reasonNonSad && (
                      <div className="text-[10px] text-red-400/80 mt-0.5 font-mono uppercase tracking-tight">
                        {mission.reasonNonSad}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                      mission.type === 'GP' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      mission.type === 'SAD' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      mission.type === 'CC' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      mission.type === 'SAD auto' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      {mission.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${mission.arEnvoye ? 'bg-indigo-500' : 'bg-white/10'}`} title="AR ENVOYE" />
                      <span className={`w-1.5 h-1.5 rounded-full ${mission.kycOk ? 'bg-emerald-500' : 'bg-white/10'}`} title="KYC OK" />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-500 text-[11px] leading-relaxed max-w-xs truncate font-medium">
                    {mission.observations || '-'}
                  </td>
                  <td className="px-6 py-5 text-[11px] text-gray-500 font-mono">
                    {mission.dateMission?.toDate ? format(mission.dateMission.toDate(), 'dd/MM/yyyy', { locale: fr }) : '-'}
                  </td>
                  <td className="px-6 py-5 text-right pr-8">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => onEdit(mission)}
                        className="text-gray-600 hover:text-indigo-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(mission.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
