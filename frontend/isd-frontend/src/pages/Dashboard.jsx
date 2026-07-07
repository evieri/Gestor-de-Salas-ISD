import { useState, useEffect } from 'react';
import { DashboardGrid } from '../components/DashboardGrid';
import { PieChart, DoorOpen, Calendar, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { api } from '../services/api';
import { useModalStore } from '../store/useModalStore';

export default function Dashboard() {
  const { refreshTrigger, dataGlobal, setDataGlobal } = useModalStore();
  const [metricas, setMetricas] = useState({
    ocupacao_percentual: 0,
    salas_livres_agora: 0,
    total_salas: 0,
    agendamentos_hoje: 0
  });

  const handlePrevDay = () => {
    const d = new Date(dataGlobal);
    d.setUTCDate(d.getUTCDate() - 1);
    setDataGlobal(d.toISOString().split('T')[0]);
  };
  
  const handleNextDay = () => {
    const d = new Date(dataGlobal);
    d.setUTCDate(d.getUTCDate() + 1);
    setDataGlobal(d.toISOString().split('T')[0]);
  };

  const setHoje = () => {
    setDataGlobal(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    api.get(`/dashboard/metricas?data_alvo=${dataGlobal}`)
      .then(res => {
        if (res.data) setMetricas(res.data);
      })
      .catch(console.error);
  }, [refreshTrigger, dataGlobal]);

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface font-sans">Visão Geral</h1>
          <p className="text-on-surface-variant text-sm mt-1 font-sans">
            Métricas logísticas do dia {new Date(dataGlobal + 'T12:00:00Z').toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        {/* Navegação Temporal */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
          <button 
            onClick={handlePrevDay} 
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
            title="Dia Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="relative flex items-center gap-2 px-2 border-x border-slate-100">
            <CalendarDays size={18} className="text-isd-teal" />
            <input 
              type="date"
              value={dataGlobal}
              onChange={(e) => setDataGlobal(e.target.value)}
              className="text-sm font-semibold text-slate-700 outline-none cursor-pointer bg-transparent"
            />
          </div>
          
          <button 
            onClick={handleNextDay} 
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
            title="Próximo Dia"
          >
            <ChevronRight size={20} />
          </button>
          
          <button 
            onClick={setHoje}
            className="ml-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors cursor-pointer"
          >
            HOJE
          </button>
        </div>
      </div>

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
            <div className={`text-3xl font-bold flex items-baseline gap-2 ${metricas.ocupacao_percentual > 80 ? 'text-orange-500' : 'text-isd-teal'}`}>
              {metricas.ocupacao_percentual}%
            </div>
            <div className="w-full bg-slate-100 mt-3 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${metricas.ocupacao_percentual > 80 ? 'bg-orange-500' : 'bg-isd-teal'}`} 
                style={{ width: `${Math.min(metricas.ocupacao_percentual, 100)}%` }}
              ></div>
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
              {metricas.salas_livres_agora} <span className="text-sm font-normal text-slate-500">/ {metricas.total_salas} total</span>
            </div>
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
            {metricas.agendamentos_hoje}
          </div>
        </div>
      </div>

      <DashboardGrid />
    </div>
  );
}