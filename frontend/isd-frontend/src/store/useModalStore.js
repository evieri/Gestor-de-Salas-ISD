import { create } from 'zustand';

export const useModalStore = create((set) => ({
  isAgendamentoOpen: false,
  preFillData: null,
  
  openAgendamento: (data = null) => set({ 
    isAgendamentoOpen: true, 
    preFillData: data 
  }),
  
  closeAgendamento: () => set({ 
    isAgendamentoOpen: false, 
    preFillData: null 
  }),
}));