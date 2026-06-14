import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export function BaseLayout() {
  return (
    <div className="bg-slate-50 min-h-screen flex font-sans overflow-x-hidden">
      <Sidebar />
      <main className="ml-[260px] w-[calc(100%-260px)] min-h-screen flex flex-col relative">
        <Header />
        {/* O Outlet é onde as páginas dinâmicas (Dashboard, Salas, etc) serão injetadas */}
        <div className="p-8 flex-1 flex flex-col max-w-[1440px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}