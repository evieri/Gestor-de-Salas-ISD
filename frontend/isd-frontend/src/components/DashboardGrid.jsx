import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';
import { api } from '../services/api';

export function DashboardGrid() {
  const { openAgendamento, refreshTrigger, dataGlobal } = useModalStore();
  const [matriz, setMatriz] = useState({});
  const [salas, setSalas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // A régua de horários exata do seu backend
  const horariosOperacionais = [8, 9, 10, 11, 13, 14, 15, 16];

  const buscarGradeReal = async () => {
    try {
      setCarregando(true);
      const response = await api.get(`/dashboard/diario?data_alvo=${dataGlobal}`);

      if (response.data && response.data.grade) {
        setMatriz(response.data.grade);

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
    e.stopPropagation(); 
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
  }, [refreshTrigger, dataGlobal]);

  // Merge Contíguo: Processamento inteligente de blocos vizinhos
  const processarBlocosDaSala = (salaId) => {
    const blocos = [];
    let blocoAtual = null;

    horariosOperacionais.forEach((hora, index) => {
      const arrayDoHorario = matriz[hora] || [];
      const dadosSlot = arrayDoHorario.find(s => s.sala_id === salaId);

      const saoIdenticos = (slot1, slot2) => {
        if (!slot1 || !slot2) return false;
        if (slot1.status !== slot2.status) return false;
        if (slot1.status === 'LIVRE') return false; 
        
        const profs1 = slot1.profissionais?.map(p => p.agendamento_id).sort().join(',') || '';
        const profs2 = slot2.profissionais?.map(p => p.agendamento_id).sort().join(',') || '';
        return profs1 === profs2 && profs1 !== '';
      };

      if (blocoAtual && saoIdenticos(blocoAtual.dadosSlot, dadosSlot)) {
        blocoAtual.colSpan += 1;
      } else {
        if (blocoAtual) blocos.push(blocoAtual);
        blocoAtual = {
          hora,
          colSpan: 1,
          dadosSlot
        };
      }
      
      if (index === horariosOperacionais.length - 1 && blocoAtual) {
        blocos.push(blocoAtual);
      }
    });
    
    return blocos;
  };

  return (
    <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col mt-6">
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-on-surface">Grade de Ocupação</h3>
          {carregando && <Loader2 size={16} className="animate-spin text-isd-teal" />}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-slate-200"></div><span className="text-sm text-on-surface-variant">Lotado</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300"></div><span className="text-sm text-on-surface-variant">Parcial</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border border-dashed border-outline-variant"></div><span className="text-sm text-on-surface-variant">Livre</span></div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full w-full overflow-auto custom-scroll">
          <div className="min-w-[1000px]">

          {salas.length === 0 && !carregando ? (
            <div className="flex items-center justify-center h-32 text-slate-500 font-medium">
              Nenhuma sala ativa encontrada no banco para montar o painel.
            </div>
          ) : (
            <div className="grid grid-cols-[130px_repeat(8,_minmax(0,_1fr))] gap-x-2 gap-y-3 p-4">
              {/* Cabeçalho */}
              <div className="sticky top-0 left-0 bg-white z-30 border-b border-r border-outline-variant/50 pb-2 pt-2"></div>
              {horariosOperacionais.map(hora => (
                <div key={hora} className="sticky top-0 bg-white z-20 text-center text-sm font-semibold text-on-surface-variant border-b border-outline-variant/50 pb-2 pt-2">
                  {hora < 10 ? `0${hora}:00` : `${hora}:00`}
                </div>
              ))}

              {/* Salas */}
              {salas.map((sala) => {
                const blocos = processarBlocosDaSala(sala.id);
                return (
                  <div key={sala.id} className="contents">
                    <div className="sticky left-0 bg-white z-10 flex items-center pr-4 border-r border-outline-variant/30 py-1.5">
                      <span className="text-sm font-medium text-on-surface truncate">{sala.nome}</span>
                    </div>

                    {blocos.map((bloco, idx) => {
                      const dadosSlot = bloco.dadosSlot;
                      
                      // Livre
                      if (!dadosSlot || dadosSlot.status === 'LIVRE') {
                        return (
                          <div
                            key={`${sala.id}-${bloco.hora}-${idx}`}
                            onClick={() => openAgendamento({ salaId: sala.id, hora: bloco.hora, data: dataGlobal })}
                            style={{ gridColumn: `span ${bloco.colSpan} / span ${bloco.colSpan}` }}
                            className="border border-dashed border-outline-variant/50 rounded-md flex items-center justify-center relative group min-h-[36px] cursor-pointer hover:bg-isd-teal/5 transition-colors"
                          >
                            <button className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-isd-teal flex items-center gap-1 transition-opacity">
                              <Plus size={16} /> Alocar
                            </button>
                          </div>
                        );
                      }

                      // Parcial
                      if (dadosSlot.status === 'PARCIAL') {
                        return (
                          <div
                            key={`${sala.id}-${bloco.hora}-${idx}`}
                            onClick={() => openAgendamento({ salaId: sala.id, hora: bloco.hora, data: dataGlobal })}
                            style={{ gridColumn: `span ${bloco.colSpan} / span ${bloco.colSpan}` }}
                            className="bg-amber-100 border border-amber-300 rounded-md px-2 py-1.5 flex flex-col relative min-h-[36px] cursor-pointer hover:bg-amber-200 transition-colors"
                            title={dadosSlot.profissionais?.map(p => p.nome).join(", ")}
                          >
                            <div className="w-full flex flex-col gap-1">
                              {dadosSlot.profissionais?.map((profObj, i) => (
                                <div key={i} className="group relative flex items-center w-full rounded-sm hover:bg-amber-300/30 transition-colors py-0.5">
                                  <span className="text-[11px] font-semibold text-amber-900 text-left truncate w-full pr-1">{profObj.nome}</span>
                                  {profObj.agendamento_id && (
                                    <button 
                                      onClick={(e) => handleExcluirAgendamento(e, profObj.agendamento_id)}
                                      className="absolute right-0 bg-amber-100 group-hover:bg-red-100 opacity-0 group-hover:opacity-100 text-red-600 rounded p-1 cursor-pointer transition-all shadow-sm border border-red-200 z-10"
                                      title="Cancelar Reserva"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // Lotado
                      return (
                        <div
                          key={`${sala.id}-${bloco.hora}-${idx}`}
                          style={{ gridColumn: `span ${bloco.colSpan} / span ${bloco.colSpan}` }}
                          className="bg-slate-200 rounded-md px-2 py-1.5 flex flex-col relative min-h-[36px] border border-transparent"
                          title={dadosSlot.profissionais?.map(p => p.nome).join(", ")}
                        >
                          <div className="w-full flex flex-col gap-1">
                            {dadosSlot.profissionais?.map((profObj, i) => (
                              <div key={i} className="group relative flex items-center w-full rounded-sm hover:bg-slate-300/40 transition-colors py-0.5">
                                  <span className="text-[11px] font-semibold text-slate-700 text-left truncate w-full pr-1">{profObj.nome}</span>
                                  {profObj.agendamento_id && (
                                    <button 
                                      onClick={(e) => handleExcluirAgendamento(e, profObj.agendamento_id)}
                                      className="absolute right-0 bg-slate-200 group-hover:bg-red-100 opacity-0 group-hover:opacity-100 text-red-600 rounded p-1 cursor-pointer transition-all shadow-sm border border-red-200 z-10"
                                      title="Cancelar Reserva"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {/* Divisória Horizontal no final de cada Sala (Trilho visual) */}
                    <div className="col-span-9 border-b border-slate-100/70 mt-1 mb-1"></div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}