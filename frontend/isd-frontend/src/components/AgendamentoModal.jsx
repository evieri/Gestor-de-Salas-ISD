import { X } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';

export function AgendamentoModal() {
  const { isAgendamentoOpen, closeAgendamento } = useModalStore();

  if (!isAgendamentoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay Escuro (Fecha o modal ao clicar fora) */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={closeAgendamento}
      ></div>

      {/* Caixa do Modal */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-on-surface">Criar Nova Reserva</h2>
          <button 
            onClick={closeAgendamento}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Selecionar Sala</label>
            <select className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal">
              <option value="">Selecione uma sala livre...</option>
              <option value="1">Consultório 102</option>
              <option value="2">Ginásio Terapêutico</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Profissional</label>
            <select className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal">
              <option value="">Selecione o profissional...</option>
              <option value="1">Dr. Silva (Oftalmologia)</option>
              <option value="2">Dra. Ana (Fisioterapia)</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm font-semibold text-slate-600">Hora Início</label>
              <select className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal">
                <option value="8">08:00</option>
                <option value="9">09:00</option>
                <option value="10">10:00</option>
                <option value="11">11:00</option>
                <option value="13">13:00</option>
                <option value="14">14:00</option>
                <option value="15">15:00</option>
                <option value="16">16:00</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm font-semibold text-slate-600">Hora Fim</label>
              <select className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal">
                <option value="9">09:00</option>
                <option value="10">10:00</option>
                <option value="11">11:00</option>
                <option value="12">12:00</option>
                <option value="14">14:00</option>
                <option value="15">15:00</option>
                <option value="16">16:00</option>
                <option value="17">17:00</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <button 
            onClick={closeAgendamento}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            CANCELAR
          </button>
          <button className="px-4 py-2 text-sm font-semibold bg-isd-teal text-white hover:bg-opacity-90 rounded-md shadow-sm transition-colors cursor-pointer">
            SALVAR RESERVA
          </button>
        </div>
      </div>
    </div>
  );
}