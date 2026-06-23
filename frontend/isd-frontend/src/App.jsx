import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BaseLayout } from './layouts/BaseLayout';
import Dashboard from './pages/Dashboard';
import Salas from './pages/Salas';
import Profissionais from './pages/Profissionais';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública Temporária: Redireciona direto pro App enquanto não temos tela de Login */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

        {/* Árvore de Rotas Privadas (Protegidas) */}
        <Route path="/app" element={<BaseLayout />}>
          {/* O index garante que /app caia no dashboard por padrão */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="salas" element={<Salas />} />
          
          {/* Placeholder para futuras telas do sitemap */}
          <Route path="agendamentos" element={<div className="p-8">Tela de Agendamentos em construção...</div>} />
          <Route path="profissionais" element={<Profissionais />} />
          <Route path="configuracoes" element={<div className="p-8">Configurações...</div>} />
        </Route>

        {/* Fallback (404 Not Found) */}
        <Route path="*" element={
          <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-slate-600">
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p className="text-lg">A página que você procura não existe.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}