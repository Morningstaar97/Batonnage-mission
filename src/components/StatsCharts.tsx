import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Mission } from '../types';
import { format, startOfMonth, eachMonthOfInterval, subMonths, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatsChartsProps {
  missions: Mission[];
}

export function StatsCharts({ missions }: StatsChartsProps) {
  // Data for Monthly Bar Chart (Last 6 Months)
  const monthlyData = useMemo(() => {
    const end = new Date();
    const start = subMonths(end, 5);
    const months = eachMonthOfInterval({ start, end });

    return months.map(month => {
      const count = missions.filter(m => {
        const date = m.dateMission ? new Date(m.dateMission) : new Date();
        return isSameMonth(date, month);
      }).length;

      return {
        name: format(month, 'MMM', { locale: fr }),
        missions: count,
      };
    });
  }, [missions]);

  // Data for Type Distribution Pie Chart
  const typeData = useMemo(() => {
    const types = ['GP', 'CC', 'SAD', 'SAD auto', 'GAG'];
    return types.map(type => ({
      name: type,
      value: missions.filter(m => m.type === type).length,
    })).filter(d => d.value > 0);
  }, [missions]);

  const COLORS = ['#F97316', '#10B981', '#3B82F6', '#6366F1', '#64748B'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Monthly Evolution */}
      <div className="bg-[#111113] p-6 rounded-[2rem] border border-white/5 shadow-xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 ml-2">
          Évolution Mensuelle
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111113', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#6366F1' }}
              />
              <Bar 
                dataKey="missions" 
                fill="#6366F1" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution by Type */}
      <div className="bg-[#111113] p-6 rounded-[2rem] border border-white/5 shadow-xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 ml-2">
          Répartition par Type
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111113', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
