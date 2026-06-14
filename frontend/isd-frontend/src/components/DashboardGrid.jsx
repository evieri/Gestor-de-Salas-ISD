import { AlertCircle, Plus } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';

export function DashboardGrid() {
  const { openAgendamento } = useModalStore();

  return (
    <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col mt-6">
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-semibold text-on-surface">Grade de Ocupação - Hoje</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-slate-200"></div><span className="text-sm text-on-surface-variant">Ocupado</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border border-dashed border-outline-variant"></div><span className="text-sm text-on-surface-variant">Livre</span></div>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <div className="min-w-[1000px] h-full p-4">
          <div className="grid grid-cols-[200px_repeat(8,_1fr)] gap-2 h-full">
            {/* Cabeçalho */}
            <div className="sticky left-0 bg-white z-10 border-b border-outline-variant/50 pb-2"></div>
            {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(hora => (
              <div key={hora} className="text-center text-sm font-semibold text-on-surface-variant border-b border-outline-variant/50 pb-2">{hora}</div>
            ))}

            {/* Linha: Consultório 102 */}
            <div className="sticky left-0 bg-white z-10 flex items-center pr-4 border-r border-outline-variant/30">
              <span className="text-sm font-medium text-on-surface">Consultório 102</span>
            </div>
            
            {/* 08:00 - Ocupado com Exceção (Falta) */}
            <div className="bg-slate-200 rounded-md p-2 flex items-center justify-center relative group min-h-[48px] cursor-pointer hover:bg-slate-300 transition-colors">
              <span className="text-sm text-on-surface">Dr. Silva</span>
              <button className="absolute -top-1 -right-1 w-6 h-6 bg-isd-orange text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" title="Registrar Falta">
                <AlertCircle size={14} />
              </button>
            </div>
            
            {/* 09:00 - Ocupado Padrão */}
            <div className="bg-slate-200 rounded-md p-2 flex items-center justify-center relative group min-h-[48px] cursor-pointer hover:bg-slate-300 transition-colors">
              <span className="text-sm text-on-surface">Dr. Silva</span>
            </div>

            {/* 10:00 - LIVRE (GATILHO AQUI) */}
            <div 
              onClick={() => openAgendamento({ salaId: '102', hora: 10 })}
              className="border border-dashed border-outline-variant/50 rounded-md flex items-center justify-center relative group min-h-[48px] cursor-pointer hover:bg-isd-teal/5 transition-colors"
            >
              <button className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-isd-teal flex items-center gap-1 transition-opacity">
                <Plus size={16} /> Alocar
              </button>
            </div>

            {/* 11:00 - LIVRE (GATILHO AQUI) */}
            <div 
              onClick={() => openAgendamento({ salaId: '102', hora: 11 })}
              className="border border-dashed border-outline-variant/50 rounded-md flex items-center justify-center relative group min-h-[48px] cursor-pointer hover:bg-isd-teal/5 transition-colors"
            >
              <button className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-isd-teal flex items-center gap-1 transition-opacity">
                <Plus size={16} /> Alocar
              </button>
            </div>
            
            {/* 13:00 às 15:00 - Bloco contínuo ocupado */}
            <div className="bg-slate-200 rounded-md p-2 flex items-center justify-center relative group min-h-[48px] cursor-pointer hover:bg-slate-300 transition-colors col-span-2">
              <span className="text-sm text-on-surface">Dra. Ana</span>
              <button className="absolute -top-1 -right-1 w-6 h-6 bg-isd-orange text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" title="Registrar Falta">
                <AlertCircle size={14} />
              </button>
            </div>

            {/* 15:00 - LIVRE (GATILHO AQUI) */}
            <div 
              onClick={() => openAgendamento({ salaId: '102', hora: 15 })}
              className="border border-dashed border-outline-variant/50 rounded-md flex items-center justify-center relative group min-h-[48px] cursor-pointer hover:bg-isd-teal/5 transition-colors"
            >
              <button className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-isd-teal flex items-center gap-1 transition-opacity">
                <Plus size={16} /> Alocar
              </button>
            </div>

            {/* 16:00 - Ocupado */}
            <div className="bg-slate-200 rounded-md p-2 flex items-center justify-center relative group min-h-[48px] cursor-pointer hover:bg-slate-300 transition-colors">
              <span className="text-sm text-on-surface">Dr. Silva</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}