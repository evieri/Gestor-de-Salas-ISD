import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';
import { api } from '../services/api';

export function AgendamentoModal() {
  const { isAgendamentoOpen, closeAgendamento, preFillData, triggerRefresh } = useModalStore();
  
  const [salaSelecionada, setSalaSelecionada] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [horaInicio, setHoraInicio] = useState(8);
  const [horaFim, setHoraFim] = useState(9);
  const [dataAgendamento, setDataAgendamento] = useState(new Date().toISOString().split('T')[0]);

  // Estados para buscar do Back-end devidamente separados
  const [listas, setListas] = useState({ salas: [], profissionais: [] });
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);

  const horarios = [8, 9, 10, 11, 13, 14, 15, 16, 17];
  const inicioOptions = [8, 9, 10, 11, 13, 14, 15, 16]; 

  // Efeito 0: Busca os dados reais no FastAPI
  useEffect(() => {
    if (isAgendamentoOpen) {
      setCarregandoDados(true);
      setErroSalvar(null);
      
      Promise.all([
        api.get('/salas').catch(() => ({ data: [] })), 
        api.get('/profissionais').catch(() => ({ data: [] }))
      ]).then(([resSalas, resProfissionais]) => {
        setListas({ 
          salas: resSalas.data, 
          profissionais: resProfissionais.data
        });
      }).finally(() => {
        setCarregandoDados(false);
      });
    }
  }, [isAgendamentoOpen]);

  // Efeito 1: Preenchimento Automático
  useEffect(() => {
    if (preFillData) {
      if (preFillData.salaId) setSalaSelecionada(preFillData.salaId);
      if (preFillData.hora) {
        setHoraInicio(preFillData.hora);
        const proximo = horarios.find(h => h > preFillData.hora) || preFillData.hora + 1;
        setHoraFim(proximo);
      }
    } else {
      setSalaSelecionada("");
      setProfissionalSelecionado("");
      setHoraInicio(8);
      setHoraFim(9);
    }
  }, [preFillData]);

  // Efeito 2: Trava de Horários
  useEffect(() => {
    if (horaInicio >= horaFim) {
      const proximoValido = horarios.find(h => h > horaInicio);
      setHoraFim(proximoValido || horaInicio + 1);
    }
  }, [horaInicio]);

  // Função de Envio pro Backend (MUST-03)
  const handleSubmit = async () => {
    if (!salaSelecionada || !profissionalSelecionado) {
      setErroSalvar("Selecione a sala e o profissional.");
      return;
    }
    
    setErroSalvar(null);
    setSalvando(true); // Alterado de setCarregando para setSalvando

    try {
      await api.post('/agendamentos', {
        sala_id: salaSelecionada,
        profissional_id: profissionalSelecionado,
        data: dataAgendamento,
        hora_inicio: horaInicio,
        hora_fim: horaFim
      });
      triggerRefresh();
      closeAgendamento();
      // Idealmente, aqui disparamos um refresh na Grade
    } catch (error) {
      // Captura o erro 400 (Overbooking) ou 422 do FastAPI
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErroSalvar("Dados inválidos. O profissional ou sala selecionados não existem no banco de dados.");
      } else {
        setErroSalvar(detail || "Erro ao salvar a reserva.");
      }
    } finally {
      setSalvando(false); // Alterado de setCarregando para setSalvando
    }
  };

  if (!isAgendamentoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeAgendamento}></div>

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-on-surface">Criar Nova Reserva</h2>
          <button onClick={closeAgendamento} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          
          {/* Mensagem de Erro de Conflito (Overbooking) */}
          {erroSalvar && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md font-medium">
              {erroSalvar}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Selecionar Sala</label>
            <select 
              value={salaSelecionada}
              onChange={(e) => setSalaSelecionada(e.target.value)}
              disabled={carregandoDados}
              className="w-full bg-white border border-slate-300 hover:border-isd-teal/50 hover:bg-slate-50 cursor-pointer transition-all rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal disabled:opacity-50"
            >
              <option value="">Selecione uma sala livre...</option>
              {listas.salas.map(sala => (
                <option key={sala.id} value={sala.id}>{sala.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Data da Reserva</label>
            <input 
              type="date"
              value={dataAgendamento}
              onChange={(e) => setDataAgendamento(e.target.value)}
              disabled={carregandoDados}
              className="w-full bg-white border border-slate-300 hover:border-isd-teal/50 hover:bg-slate-50 cursor-pointer transition-all rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Profissional</label>
            <select 
              value={profissionalSelecionado}
              onChange={(e) => setProfissionalSelecionado(e.target.value)}
              disabled={carregandoDados}
              className="w-full bg-white border border-slate-300 hover:border-isd-teal/50 hover:bg-slate-50 cursor-pointer transition-all rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal disabled:opacity-50"
            >
              <option value="">Selecione o profissional...</option>
              {listas.profissionais.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.nome_completo} - {prof.especialidade}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm font-semibold text-slate-600">Hora Início</label>
              <select 
                value={horaInicio}
                onChange={(e) => setHoraInicio(parseInt(e.target.value))}
                disabled={carregandoDados}
                className="w-full bg-white border border-slate-300 hover:border-isd-teal/50 hover:bg-slate-50 cursor-pointer transition-all rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal disabled:opacity-50"
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
                disabled={carregandoDados}
                className="w-full bg-white border border-slate-300 hover:border-isd-teal/50 hover:bg-slate-50 cursor-pointer transition-all rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal disabled:opacity-50"
              >
                {horarios.filter(h => h > horaInicio).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <button onClick={closeAgendamento} disabled={carregandoDados} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50">
            CANCELAR
          </button>
          <button 
            onClick={handleSubmit}
            disabled={salvando || carregandoDados}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-isd-teal text-white hover:bg-opacity-90 rounded-md shadow-sm transition-colors cursor-pointer disabled:opacity-70"
          >
            {salvando && <Loader2 size={16} className="animate-spin" />}
            {salvando ? "SALVANDO..." : "SALVAR RESERVA"}
          </button>
        </div>
      </div>
    </div>
  );
}