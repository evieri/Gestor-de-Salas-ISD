import { LayoutDashboard, DoorOpen, Calendar, UserSquare, Settings, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="w-sidebar_width fixed left-0 top-0 bg-primary flex flex-col h-screen py-8 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
          <Activity className="text-primary" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-on-primary">Gestor ISD</h1>
          <p className="text-xs text-on-primary opacity-80">Regulação Física</p>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1 relative">
        <Link to="/app/dashboard" className="flex items-center gap-4 px-4 py-2 bg-primary-container text-white border-l-4 border-isd-gold cursor-pointer rounded-r-lg group">
          <LayoutDashboard size={20} />
          <span className="text-sm font-semibold">Dashboard</span>
        </Link>
        <Link to="/app/salas" className="flex items-center gap-4 px-4 py-2 text-on-primary opacity-80 hover:bg-primary-container hover:opacity-100 transition-all border-l-4 border-transparent cursor-pointer rounded-r-lg group">
          <DoorOpen size={20} />
          <span className="text-sm font-semibold">Salas</span>
        </Link>
        <Link to="/app/agendamentos" className="flex items-center gap-4 px-4 py-2 text-on-primary opacity-80 hover:bg-primary-container hover:opacity-100 transition-all border-l-4 border-transparent cursor-pointer rounded-r-lg group">
          <Calendar size={20} />
          <span className="text-sm font-semibold">Agendamentos</span>
        </Link>
        <Link to="/app/profissionais" className="flex items-center gap-4 px-4 py-2 text-on-primary opacity-80 hover:bg-primary-container hover:opacity-100 transition-all border-l-4 border-transparent cursor-pointer rounded-r-lg group">
          <UserSquare size={20} />
          <span className="text-sm font-semibold">Profissionais</span>
        </Link>
        <Link to="/app/configuracoes" className="flex items-center gap-4 px-4 py-2 text-on-primary opacity-80 hover:bg-primary-container hover:opacity-100 transition-all border-l-4 border-transparent cursor-pointer rounded-r-lg absolute bottom-8 w-[calc(100%-16px)]">
          <Settings size={20} />
          <span className="text-sm font-semibold">Configurações</span>
        </Link>
      </nav>
    </aside>
  );
}