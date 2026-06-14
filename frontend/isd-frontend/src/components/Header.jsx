import { Download, UserCircle, Plus } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';

export function Header() {
  const { openAgendamento } = useModalStore();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-outline-variant flex justify-between items-center w-full px-8 py-4">
      <div>
        <h2 className="text-xl font-semibold text-on-surface">Dashboard de Ocupação</h2>
        <p className="text-sm text-on-surface-variant">Visão Diária do Instituto</p>
      </div>
      <div className="flex items-center gap-4">
        {/* Exportação virou ícone utilitário */}
        <button 
          title="Exportar Grade (.xlsx)"
          className="text-on-surface-variant hover:text-isd-teal transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-100"
        >
          <Download size={22} />
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