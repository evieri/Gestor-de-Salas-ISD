import { create } from 'zustand';

export const useModalStore = create((set) => ({
  isAgendamentoOpen: false,
  openAgendamento: () => set({ isAgendamentoOpen: true }),
  closeAgendamento: () => set({ isAgendamentoOpen: false }),
}));