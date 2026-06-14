import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';

export function AgendamentoModal() {
  const { isAgendamentoOpen, closeAgendamento } = useModalStore();
  
  // Estado local para controlar a trava matemática
  const [horaInicio, setHoraInicio] = useState(8);
  const [horaFim, setHoraFim] = useState(9);

  // A regra de negócio do ISD mapeada: Expediente pulando as 12h
  const horarios = [8, 9, 10, 11, 13, 14, 15, 16, 17];
  // O início nunca pode ser 17h, pois a clínica fecha 17h
  const inicioOptions = [8, 9, 10, 11, 13, 14, 15, 16]; 

  // Efeito que garante que a Hora Fim se auto-corrija se o usuário empurrar a Hora Início para frente
  useEffect(() => {
    if (horaInicio >= horaFim) {
      // Pega o próximo horário válido disponível após a horaInicio
      const proximoValido = horarios.find(h => h > horaInicio);
      setHoraFim(proximoValido || horaInicio + 1);
    }
  }, [horaInicio]); // Executa sempre que a horaInicio mudar

  if (!isAgendamentoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeAgendamento}></div>

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-on-surface">Criar Nova Reserva</h2>
          <button onClick={closeAgendamento} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1">
            <X size={20} />
          </button>
        </div>

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
              <select 
                value={horaInicio}
                onChange={(e) => setHoraInicio(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal"
              >
                {inicioOptions.map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm font-semibold text-slate-600">Hora Fim</label>
              <select 
                value={horaFim}
                onChange={(e) => setHoraFim(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal"
              >
                {/* O Filter garante que a lista de término NUNCA mostre horas menores ou iguais ao Início */}
                {horarios.filter(h => h > horaInicio).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <button onClick={closeAgendamento} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer">
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