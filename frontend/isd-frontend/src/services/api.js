import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição (MUST-01: Autenticação JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ISD:token'); // Buscaremos isso no futuro
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Resposta (Tratamento global de erros)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se o token expirar ou for inválido, derruba o usuário da sessão
      console.error("Não autorizado. Redirecionando para login...");
      localStorage.removeItem('@ISD:token');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);