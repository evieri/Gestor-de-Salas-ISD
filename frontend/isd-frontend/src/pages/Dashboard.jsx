import { useState, useEffect } from 'react';
import { DashboardGrid } from '../components/DashboardGrid';
import { PieChart, DoorOpen, Calendar, Download, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useModalStore } from '../store/useModalStore';

export default function Dashboard() {
  const { refreshTrigger } = useModalStore();
  const [metricas, setMetricas] = useState({
    ocupacao_percentual: 0,
    salas_livres_agora: 0,
    total_salas: 0,
    agendamentos_hoje: 0
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExportarSemana = () => {
    setIsExporting(true);
    const dataSelecionada = new Date().toISOString().split('T')[0]; 
    
    api.get('/dashboard/exportar', { 
      params: { data_alvo: dataSelecionada }, 
      responseType: 'blob' 
    })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // O nome do arquivo real virá no header ou setamos o default aqui
      link.setAttribute('download', 'grade_semanal.xlsx');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup de memória
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
    const hoje = new Date().toISOString().split('T')[0];
    api.get(`/dashboard/metricas?data_alvo=${hoje}`)
      .then(res => {
        if (res.data) setMetricas(res.data);
      })
      .catch(console.error);
  }, [refreshTrigger]);

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface font-sans">Visão Geral</h1>
          <p className="text-on-surface-variant text-sm mt-1 font-sans">Métricas e acompanhamento do uso de salas</p>
        </div>
        <button
          onClick={handleExportarSemana}
          disabled={isExporting}
          className="flex items-center gap-2 bg-isd-teal text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow hover:bg-opacity-90 transition-all disabled:opacity-70 cursor-pointer"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {isExporting ? "Gerando Excel..." : "Exportar Semana"}
        </button>
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