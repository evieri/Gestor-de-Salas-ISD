import { create } from 'zustand';

const getLocalYYYYMMDD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useModalStore = create((set) => ({
  isAgendamentoOpen: false,
  preFillData: null,
  refreshTrigger: 0,
  dataGlobal: getLocalYYYYMMDD(),
  
  setDataGlobal: (data) => set({ dataGlobal: data }),
  
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