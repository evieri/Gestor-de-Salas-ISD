import { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const buscarAgendamentos = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/agendamentos');
      setAgendamentos(res.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  const handleExcluirAgendamento = async (id, dataReserva) => {
    const hoje = new Date().toISOString().split('T')[0];
    if (dataReserva < hoje) {
      return; // Fallback de segurança no frontend
    }

    if (window.confirm("Deseja cancelar esta reserva e liberar a sala no sistema?")) {
      try {
        await api.delete(`/agendamentos/${id}`);
        buscarAgendamentos();
      } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        if (error.response && error.response.status === 400) {
          alert(error.response.data.detail || "Não é possível cancelar este agendamento.");
        } else {
          alert("Erro interno ao cancelar a reserva.");
        }
      }
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface font-sans">Gestão de Reservas</h1>
          <p className="text-on-surface-variant mt-1 text-sm font-sans">Histórico e cancelamento de agendamentos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Horário</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sala</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Profissional</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carregando ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-isd-teal" />
                    <p className="text-sm">Carregando agendamentos...</p>
                  </td>
                </tr>
              ) : agendamentos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">
                    Nenhuma reserva encontrada no banco.
                  </td>
                </tr>
              ) : (
                agendamentos.map((item) => {
                  const isPassado = item.data < hojeStr;
                  // Cria data com T00:00:00 para evitar que o fuso horário volte um dia
                  const dataObj = new Date(item.data + "T00:00:00");
                  const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-slate-700">{dataFormatada}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {item.hora_inicio < 10 ? `0${item.hora_inicio}:00` : `${item.hora_inicio}:00`} às {item.hora_fim < 10 ? `0${item.hora_fim}:00` : `${item.hora_fim}:00`}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 font-medium">{item.sala.nome}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{item.profissional.nome_completo}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end">
                          <button 
                            onClick={() => handleExcluirAgendamento(item.id, item.data)} 
                            className={`p-1.5 transition-colors rounded ${isPassado ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer'}`}
                            title={isPassado ? 'Auditoria: Não é possível cancelar reservas passadas' : 'Cancelar Reserva'}
                            disabled={isPassado}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
