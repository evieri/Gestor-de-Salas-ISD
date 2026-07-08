import { LayoutDashboard, DoorOpen, Calendar, UserSquare, Settings, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  // Variáveis para não poluir o HTML com repetição de classes
  const activeClass = "flex items-center gap-4 px-4 py-2 bg-primary-container text-white border-l-4 border-isd-gold cursor-pointer rounded-r-lg transition-all";
  const inactiveClass = "flex items-center gap-4 px-4 py-2 text-on-primary opacity-80 hover:bg-primary-container hover:opacity-100 border-l-4 border-transparent cursor-pointer rounded-r-lg transition-all";

  return (
    <aside className="w-sidebar_width fixed left-0 top-0 bg-primary flex flex-col h-screen py-8 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
          <Activity className="text-primary" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-isd-gold">ALOCA</h1>
          <p className="text-[10px] uppercase font-bold text-on-primary opacity-60 tracking-widest mt-0.5">Gestor de Espaços</p>
        </div>
      </div>

      {/* Trocado para flex-col para o mt-auto funcionar */}
      <nav className="flex-1 flex flex-col px-2 space-y-1">
        <Link to="/app/dashboard" className={path.includes('dashboard') ? activeClass : inactiveClass}>
          <LayoutDashboard size={20} />
          <span className="text-sm font-semibold">Dashboard</span>
        </Link>
        <Link to="/app/salas" className={path.includes('salas') ? activeClass : inactiveClass}>
          <DoorOpen size={20} />
          <span className="text-sm font-semibold">Salas</span>
        </Link>
        <Link to="/app/agendamentos" className={path.includes('agendamentos') ? activeClass : inactiveClass}>
          <Calendar size={20} />
          <span className="text-sm font-semibold">Agendamentos</span>
        </Link>
        <Link to="/app/profissionais" className={path.includes('profissionais') ? activeClass : inactiveClass}>
          <UserSquare size={20} />
          <span className="text-sm font-semibold">Profissionais</span>
        </Link>
        
        {/* mt-auto empurra esse bloco para o fundo da tela, sem quebrar o layout */}
        <div className="mt-auto mb-2">
          <Link to="/app/configuracoes" className={path.includes('configuracoes') ? activeClass : inactiveClass}>
            <Settings size={20} />
            <span className="text-sm font-semibold">Configurações</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}