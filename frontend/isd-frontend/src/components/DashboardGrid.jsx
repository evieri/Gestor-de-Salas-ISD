import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';
import { api } from '../services/api';

export function DashboardGrid() {
  const { openAgendamento, refreshTrigger } = useModalStore();
  const [matriz, setMatriz] = useState({});
  const [salas, setSalas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // A régua de horários exata do seu backend
  const horariosOperacionais = [8, 9, 10, 11, 13, 14, 15, 16];

  const buscarGradeReal = async () => {
    try {
      setCarregando(true);
      const hoje = new Date().toISOString().split('T')[0];

      const response = await api.get(`/dashboard/diario?data_alvo=${hoje}`);

      // O seu backend retorna: { data, dia_semana, grade: { "8": [...], "9": [...] } }
      if (response.data && response.data.grade) {
        setMatriz(response.data.grade);

        // Pega a lista de salas do primeiro horário (8h) para montar o eixo Y vertical
        const primeiroHorario = horariosOperacionais[0];
        const salasDoPrimeiroHorario = response.data.grade[primeiroHorario] || [];

        const listaSalas = salasDoPrimeiroHorario.map(s => ({
          id: s.sala_id,
          nome: s.sala_nome
        }));

        setSalas(listaSalas);
      }
    } catch (error) {
      console.error("Erro ao ler matriz do dashboard:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirAgendamento = async (e, agendamento_id) => {
    e.stopPropagation(); // Evita abrir o modal de criação ao clicar na lixeira
    if (!agendamento_id) return;
    
    if (window.confirm("Tem certeza que deseja cancelar esse agendamento?")) {
      try {
        await api.delete(`/agendamentos/${agendamento_id}`);
        buscarGradeReal();
      } catch (error) {
        console.error("Erro ao cancelar agendamento:", error);
        if (error.response && error.response.data && error.response.data.detail) {
          alert(error.response.data.detail);
        } else {
          alert("Erro interno ao cancelar a reserva.");
        }
      }
    }
  };

  useEffect(() => {
    buscarGradeReal();
  }, [refreshTrigger]);

  return (
    <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col mt-6">
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-on-surface">Grade de Ocupação - Hoje</h3>
          {carregando && <Loader2 size={16} className="animate-spin text-isd-teal" />}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-slate-200"></div><span className="text-sm text-on-surface-variant">Lotado</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300"></div><span className="text-sm text-on-surface-variant">Parcial</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border border-dashed border-outline-variant"></div><span className="text-sm text-on-surface-variant">Livre</span></div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <div className="min-w-[1000px] h-full p-4">

          {salas.length === 0 && !carregando ? (
            <div className="flex items-center justify-center h-32 text-slate-500 font-medium">
              Nenhuma sala ativa encontrada no banco para montar o painel.
            </div>
          ) : (
            <div className="grid grid-cols-[200px_repeat(8,_1fr)] gap-2 h-full">
              {/* Linha do Cabeçalho de Horários */}
              <div className="sticky left-0 bg-white z-10 border-b border-outline-variant/50 pb-2"></div>
              {horariosOperacionais.map(hora => (
                <div key={hora} className="text-center text-sm font-semibold text-on-surface-variant border-b border-outline-variant/50 pb-2">
                  {hora < 10 ? `0${hora}:00` : `${hora}:00`}
                </div>
              ))}

              {/* Renderiza as Linhas baseadas nas salas reais */}
              {salas.map((sala) => (
                <div key={sala.id} className="contents">
                  {/* Nome da Sala Fixa à Esquerda */}
                  <div className="sticky left-0 bg-white z-10 flex items-center pr-4 border-r border-outline-variant/30 py-2">
                    <span className="text-sm font-medium text-on-surface truncate">{sala.nome}</span>
                  </div>

                  {/* Células de Horário na Horizontal */}
                  {horariosOperacionais.map(hora => {
                    // Puxa o array de salas daquele horário exato e encontra a sala atual
                    const arrayDoHorario = matriz[hora] || [];
                    const dadosSlot = arrayDoHorario.find(s => s.sala_id === sala.id);

                    // Renderiza Livre (Clicável para abrir modal com os dados injetados)
                    if (!dadosSlot || dadosSlot.status === 'LIVRE') {
                      return (
                        <div
                          key={`${sala.id}-${hora}`}
                          onClick={() => openAgendamento({ salaId: sala.id, hora: hora })}
                          className="border border-dashed border-outline-variant/50 rounded-md flex items-center justify-center relative group min-h-[48px] cursor-pointer hover:bg-isd-teal/5 transition-colors"
                        >
                          <button className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-isd-teal flex items-center gap-1 transition-opacity">
                            <Plus size={16} /> Alocar
                          </button>
                        </div>
                      );
                    }

                    // Renderiza Parcial
                    if (dadosSlot.status === 'PARCIAL') {
                      return (
                        <div
                          key={`${sala.id}-${hora}`}
                          onClick={() => openAgendamento({ salaId: sala.id, hora: hora })}
                          className="bg-amber-100 border border-amber-300 rounded-md p-1 flex flex-col items-center justify-center relative min-h-[48px] cursor-pointer hover:bg-amber-200 transition-colors gap-0.5"
                          title={dadosSlot.profissionais?.map(p => p.nome).join(", ")}
                        >
                          <div className="text-xs font-semibold text-amber-900 text-center leading-tight w-full flex flex-col mb-3">
                            {dadosSlot.profissionais?.map((profObj, idx) => (
                              <div key={idx} className="group flex justify-between items-center gap-2 w-full px-1">
                                <span className="block w-full truncate">{profObj.nome}</span>
                                {profObj.agendamento_id && (
                                  <button 
                                    onClick={(e) => handleExcluirAgendamento(e, profObj.agendamento_id)}
                                    className="hidden group-hover:block text-red-600 hover:bg-red-200 rounded-full p-1 cursor-pointer transition-all shrink-0"
                                    title="Cancelar Reserva"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="absolute bottom-0 right-1 text-[9px] text-amber-700 font-bold tracking-wider">
                            {dadosSlot.ocupacao_atual}/{dadosSlot.capacidade_maxima}
                          </span>
                        </div>
                      );
                    }

                    // Renderiza Lotado
                    return (
                      <div
                        key={`${sala.id}-${hora}`}
                        className="bg-slate-200 rounded-md p-1 flex flex-col items-center justify-center relative min-h-[48px] border border-transparent gap-0.5"
                        title={dadosSlot.profissionais?.map(p => p.nome).join(", ")}
                      >
                        <div className="text-xs font-semibold text-on-surface text-center leading-tight w-full flex flex-col">
                          {dadosSlot.profissionais?.map((profObj, idx) => (
                            <div key={idx} className="group flex justify-between items-center gap-2 w-full px-1">
                                <span className="block w-full truncate">{profObj.nome}</span>
                                {profObj.agendamento_id && (
                                  <button 
                                    onClick={(e) => handleExcluirAgendamento(e, profObj.agendamento_id)}
                                    className="hidden group-hover:block text-red-600 hover:bg-red-200 rounded-full p-1 cursor-pointer transition-all shrink-0"
                                    title="Cancelar Reserva"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}