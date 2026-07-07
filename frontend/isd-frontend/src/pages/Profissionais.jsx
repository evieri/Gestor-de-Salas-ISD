import { useState, useEffect } from 'react';
import { Plus, Edit, Ban, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para o Modal de Criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [registroConselho, setRegistroConselho] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState(null);
  const [itemEmEdicao, setItemEmEdicao] = useState(null);

  const buscarProfissionais = async () => {
    try {
      setCarregando(true);
      const response = await api.get('/profissionais');
      setProfissionais(response.data);
    } catch (error) {
      console.error("Erro ao carregar profissionais do banco:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarProfissionais();
  }, []);

  const handleEditarProfissional = (prof) => {
    setNomeCompleto(prof.nome_completo);
    setEspecialidade(prof.especialidade);
    setRegistroConselho(prof.registro_conselho);
    setItemEmEdicao(prof.id);
    setErroModal(null);
    setIsModalOpen(true);
  };

  const handleExcluirProfissional = async (id) => {
    if (window.confirm("Tem certeza que deseja inativar este profissional?")) {
      try {
        await api.delete(`/profissionais/${id}`);
        buscarProfissionais();
      } catch (error) {
        console.error("Erro ao inativar profissional:", error);
        alert("Erro ao inativar profissional.");
      }
    }
  };

  const handleSalvarProfissional = async (e) => {
    e.preventDefault();
    if (!nomeCompleto.trim() || !especialidade.trim() || !registroConselho.trim()) return;

    setSalvando(true);
    setErroModal(null);

    const payload = {
      nome_completo: nomeCompleto,
      especialidade: especialidade,
      registro_conselho: registroConselho
    };

    try {
      if (itemEmEdicao) {
        await api.put(`/profissionais/${itemEmEdicao}`, payload);
      } else {
        await api.post('/profissionais', payload);
      }

      setNomeCompleto('');
      setEspecialidade('');
      setRegistroConselho('');
      setItemEmEdicao(null);
      setIsModalOpen(false);
      buscarProfissionais();
    } catch (error) {
      console.error("Erro completo:", error.response?.data);

      if (error.response?.data?.detail === "Registro já cadastrado") {
        setErroModal("Registro já cadastrado. Verifique o número inserido.");
      } else if (error.response?.status === 422) {
        setErroModal("Erro de formato nos dados enviados. Verifique o console.");
      } else {
        setErroModal(error.response?.data?.detail || "Falha ao criar profissional.");
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2 font-sans">
            Gestão de Profissionais
          </h1>
          <p className="text-base text-on-surface-variant font-sans">
            Gerencie a equipe clínica disponível para agendamento
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              setItemEmEdicao(null);
              setNomeCompleto('');
              setEspecialidade('');
              setRegistroConselho('');
              setIsModalOpen(true);
            }}
            className="bg-isd-teal hover:bg-opacity-90 text-white font-semibold text-sm px-5 py-2.5 rounded shadow-sm transition-all flex items-center gap-2 w-full md:w-auto justify-center cursor-pointer"
          >
            <Plus size={16} />
            NOVA PESSOA
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Profissional</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Especialidade</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registro</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {carregando ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-sans">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-isd-teal" />
                      Carregando equipe do banco...
                    </div>
                  </td>
                </tr>
              ) : profissionais.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-sans">
                    Nenhum profissional cadastrado no sistema. Crie um para começar.
                  </td>
                </tr>
              ) : (
                profissionais.map((prof) => (
                  <tr key={prof.id} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-on-surface font-medium font-sans">{prof.nome_completo}</td>
                    <td className="py-3 px-4 text-slate-600 font-sans">{prof.especialidade}</td>
                    <td className="py-3 px-4 text-slate-600 font-sans">{prof.registro_conselho}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${prof.ativo ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                        {prof.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2 text-slate-400">
                        <button onClick={() => handleEditarProfissional(prof)} className="p-1 hover:text-isd-teal transition-colors rounded cursor-pointer" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleExcluirProfissional(prof.id)} className="p-1 hover:text-isd-orange transition-colors rounded cursor-pointer" title="Inativar">
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação Básica */}
        <div className="border-t border-slate-200 py-3 px-4 flex items-center justify-between bg-white">
          <span className="text-xs text-slate-500">
            Mostrando {profissionais.length} de {profissionais.length} resultados
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 cursor-pointer" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 cursor-pointer" disabled>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-on-surface font-sans">
                {itemEmEdicao ? 'Editar Profissional' : 'Cadastrar Novo Profissional'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarProfissional}>
              <div className="p-6 flex flex-col gap-4">
                {erroModal && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md font-medium font-sans">
                    {erroModal}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-600 font-sans">Nome Completo</label>
                  <input
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Ex: Dra. Ana Silva"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal font-sans"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-600 font-sans">Especialidade</label>
                  <input
                    type="text"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    placeholder="Ex: Fisioterapia"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal font-sans"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-600 font-sans">Registro do Conselho</label>
                  <input
                    type="text"
                    value={registroConselho}
                    onChange={(e) => setRegistroConselho(e.target.value)}
                    placeholder="Ex: CREFITO 1234"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-isd-teal focus:ring-1 focus:ring-isd-teal font-sans"
                    required
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer font-sans"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-isd-teal text-white hover:bg-opacity-90 rounded-md shadow-sm transition-colors cursor-pointer font-sans disabled:opacity-70"
                >
                  {salvando && <Loader2 size={16} className="animate-spin" />}
                  {salvando ? "SALVANDO..." : (itemEmEdicao ? "ATUALIZAR PROFISSIONAL" : "SALVAR PROFISSIONAL")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
