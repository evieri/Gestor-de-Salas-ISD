import { Plus, Search, Filter, Edit, Ban, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Salas() {
  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Header Interno da Seção */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2 font-sans">
            Infraestrutura Física
          </h1>
          <p className="text-base text-on-surface-variant font-sans">
            Gerencie as salas e laboratórios disponíveis para agendamento
          </p>
        </div>
        <div>
          <button className="bg-isd-teal hover:bg-opacity-90 text-white font-semibold text-sm px-5 py-2.5 rounded shadow-sm transition-all flex items-center gap-2 w-full md:w-auto justify-center cursor-pointer">
            <Plus size={16} />
            NOVA SALA
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96 rounded bg-white border border-slate-200 flex items-center px-3 py-2 focus-within:border-isd-teal focus-within:ring-2 focus-within:ring-isd-teal/10 transition-all">
          <Search className="text-slate-400 mr-2" size={20} />
          <input 
            className="w-full bg-transparent border-none p-0 text-sm font-sans text-on-surface placeholder:text-slate-400 focus:ring-0 outline-none" 
            placeholder="Buscar por nome ou setor..." 
            type="text"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-semibold w-full sm:w-auto justify-center cursor-pointer">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Dados (Data Table) */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Sala</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Setor</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacidade</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* Linha 1 */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-on-surface font-medium">Sala 101</td>
                <td className="py-3 px-4 text-slate-600">Terapia</td>
                <td className="py-3 px-4 text-slate-600">1 Profissional</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Ativo
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button className="p-1 hover:text-isd-teal transition-colors rounded cursor-pointer" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button className="p-1 hover:text-isd-orange transition-colors rounded cursor-pointer" title="Inativar">
                      <Ban size={18} />
                    </button>
                  </div>
                </td>
              </tr>
              {/* Linha 2 */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-on-surface font-medium">Lab 02</td>
                <td className="py-3 px-4 text-slate-600">Geral</td>
                <td className="py-3 px-4 text-slate-600">5 Profissionais</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Ativo
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button className="p-1 hover:text-isd-teal transition-colors rounded cursor-pointer" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button className="p-1 hover:text-isd-orange transition-colors rounded cursor-pointer" title="Inativar">
                      <Ban size={18} />
                    </button>
                  </div>
                </td>
              </tr>
              {/* Linha 3 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-on-surface font-medium">Consultório 5</td>
                <td className="py-3 px-4 text-slate-600">Terapia</td>
                <td className="py-3 px-4 text-slate-600">2 Profissionais</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Inativo
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button className="p-1 hover:text-isd-teal transition-colors rounded cursor-pointer" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button className="p-1 hover:text-red-600 transition-colors rounded cursor-pointer" title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="border-t border-slate-200 py-3 px-4 flex items-center justify-between bg-white">
          <span className="text-xs text-slate-500">Mostrando 1 a 3 de 3 resultados</span>
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
    </div>
  );
}