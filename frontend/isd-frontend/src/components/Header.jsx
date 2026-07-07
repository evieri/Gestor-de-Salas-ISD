import { Download, UserCircle, Plus, Loader2 } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';
import { useState } from 'react';
import { api } from '../services/api';

export function Header() {
  const { openAgendamento } = useModalStore();
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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-outline-variant flex justify-between items-center w-full px-8 py-4">
      <div>
        <h2 className="text-xl font-semibold text-on-surface">Dashboard de Ocupação</h2>
        <p className="text-sm text-on-surface-variant">Visão Diária do Instituto</p>
      </div>
      <div className="flex items-center gap-4">
        {/* Exportação virou ícone utilitário */}
        <button 
          title="Exportar Grade Semanal (.xlsx)"
          onClick={handleExportarSemana}
          disabled={isExporting}
          className="text-on-surface-variant hover:text-isd-teal transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
        >
          {isExporting ? <Loader2 size={22} className="animate-spin text-isd-teal" /> : <Download size={22} />}
        </button>
        
        <div className="h-8 w-px bg-outline-variant mx-2"></div>
        
        {/* A CTA Primária */}
        <button 
          onClick={openAgendamento} // GATILHO ADICIONADO AQUI
          className="flex items-center gap-2 px-6 py-2.5 bg-isd-teal text-white rounded-md font-semibold text-sm hover:bg-opacity-90 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          NOVO AGENDAMENTO
        </button>
        
        <div className="h-8 w-px bg-outline-variant mx-2"></div>

        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <UserCircle size={32} />
        </button>
      </div>
    </header>
  );
}