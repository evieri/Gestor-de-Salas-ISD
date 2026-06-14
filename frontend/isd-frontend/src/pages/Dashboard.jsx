import { DashboardGrid } from '../components/DashboardGrid';
import { PieChart, DoorOpen, Calendar, ArrowUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase">Ocupação</span>
            <div className="w-8 h-8 rounded-full bg-isd-teal/10 flex items-center justify-center">
              <PieChart className="text-isd-teal" size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-isd-teal flex items-baseline gap-2">
              85% <span className="text-sm text-green-600 flex items-center"><ArrowUp size={14} /> 5%</span>
            </div>
            <div className="w-full bg-slate-100 mt-3 rounded-full h-1.5">
              <div className="bg-isd-teal h-1.5 rounded-full w-[85%]"></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase">Salas Livres</span>
            <div className="w-8 h-8 rounded-full bg-isd-gold/20 flex items-center justify-center">
              <DoorOpen className="text-yellow-700" size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-800 flex items-baseline gap-2">
              4 <span className="text-sm font-normal text-slate-500">/ 24 total</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Disponibilidade atual crítica</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase">Agendamentos Hoje</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <Calendar className="text-isd-teal" size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 flex items-baseline gap-2">
            18
          </div>
        </div>
      </div>

      <DashboardGrid />
    </div>
  );
}