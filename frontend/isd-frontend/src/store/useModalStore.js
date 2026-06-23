import { create } from 'zustand';

export const useModalStore = create((set) => ({
  isAgendamentoOpen: false,
  preFillData: null,
  refreshTrigger: 0,
  
  openAgendamento: (data = null) => set({ 
    isAgendamentoOpen: true, 
    preFillData: data 
  }),
  
  closeAgendamento: () => set({ 
    isAgendamentoOpen: false, 
    preFillData: null 
  }),

  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));