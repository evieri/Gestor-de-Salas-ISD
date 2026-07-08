import { useState, useEffect } from 'react';
import { DashboardGrid } from '../components/DashboardGrid';
import { PieChart, DoorOpen, Calendar, ChevronLeft, ChevronRight, CalendarDays, Download, Plus, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useModalStore } from '../store/useModalStore';

export default function Dashboard() {
  const { refreshTrigger, dataGlobal, setDataGlobal, openAgendamento } = useModalStore();
  const [isExporting, setIsExporting] = useState(false);
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

  const getLocalYYYYMMDD = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const setHoje = () => {
    setDataGlobal(getLocalYYYYMMDD());
  };

  const handleExportarSemana = () => {
    setIsExporting(true);
    
    api.get('/dashboard/exportar', { 
      params: { data_alvo: dataGlobal }, 
      responseType: 'blob' 
    })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'grade_semanal.xlsx');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Erro ao exportar:", error);
      alert("Erro ao gerar a planilha. Tente novamente.");
    })
    .finally(() => {
      setIsExporting(false);
    });
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
      {/* Cabeçalho de Ações Específico do Dashboard */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface font-sans tracking-tight">Dashboard de Ocupação</h1>
          <p className="text-sm text-on-surface-variant font-sans mt-1">Visão global e logística do instituto</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            title="Exportar Grade Semanal (.xlsx)"
            onClick={handleExportarSemana}
            disabled={isExporting}
            className="text-on-surface-variant hover:text-isd-teal transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <Loader2 size={22} className="animate-spin text-isd-teal" /> : <Download size={22} />}
          </button>
          
          <div className="h-8 w-px bg-outline-variant mx-1"></div>
          
          <button 
            onClick={() => openAgendamento()}
            className="flex items-center gap-2 px-6 py-2.5 bg-isd-teal text-white rounded-md font-semibold text-sm hover:bg-opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={18} />
            NOVO AGENDAMENTO
          </button>
        </div>
      </div>

      {/* Metric Cards - Agora com 4 Colunas para abrigar a Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        
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

        {/* Card 4: Navegação Temporal */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase">Data Base</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors relative" title="Escolher data específica">
              <CalendarDays className="text-slate-600" size={18} />
              <input 
                type="date" 
                value={dataGlobal} 
                onChange={(e) => setDataGlobal(e.target.value)} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-slate-800 flex items-baseline gap-2">
              {new Date(dataGlobal + 'T12:00:00Z').getDate().toString().padStart(2, '0')}
              <span className="text-sm font-normal text-slate-500 capitalize">
                {new Date(dataGlobal + 'T12:00:00Z').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')} de {new Date(dataGlobal + 'T12:00:00Z').getFullYear()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button 
              onClick={setHoje}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                dataGlobal === getLocalYYYYMMDD() 
                  ? 'bg-slate-100 text-slate-400 cursor-default pointer-events-none'
                  : 'bg-isd-teal/10 text-isd-teal hover:bg-isd-teal/20 cursor-pointer'
              }`}
            >
              HOJE
            </button>
            
            <div className="flex gap-1">
              <button onClick={handlePrevDay} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 transition-colors cursor-pointer" title="Dia Anterior">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextDay} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 transition-colors cursor-pointer" title="Próximo Dia">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      <DashboardGrid />
    </div>
  );
}