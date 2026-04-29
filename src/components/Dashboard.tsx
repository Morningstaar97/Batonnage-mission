import { MissionStats } from '../types';
import { motion } from 'motion/react';
import { Activity, Car, Home, CheckCircle2, TrendingUp, Database } from 'lucide-react';

interface DashboardProps {
  stats: MissionStats;
}

export function Dashboard({ stats }: DashboardProps) {
  const cards = [
    { label: 'Garage Partenaire', value: stats.gp, icon: Car, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Service à domicile', value: stats.sad, icon: Home, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Garage Client', value: stats.cc, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'SAD Auto', value: stats.sadAuto, icon: Car, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'GAG', value: stats.gag, icon: Database, color: 'text-gray-400', bg: 'bg-white/5' },
    { label: 'Total GP (GP+SAD)', value: stats.totalGP, icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Total Missions', value: stats.total, icon: Database, color: 'text-gray-400', bg: 'bg-gray-400/10' },
    { label: 'Taux (Eff.)', value: `${Math.round(stats.taux * 100)}%`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 mb-8">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 shadow-sm hover:border-white/10 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-1.5 rounded-lg ${card.bg} group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">
              {card.label.split('(')[0].trim()}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 overflow-hidden">
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              {card.value}
            </span>
            {card.label.includes('(') && (
              <span className="text-[9px] text-gray-600 font-mono truncate">
                {card.label.match(/\(([^)]+)\)/)?.[0]}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
