import { Task, Project } from '../context/AppContext';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'bongodemy_app_state_v1';

export interface AppState {
  tasks: Task[];
  projects: Project[];
  clients: any[];
  invoices: any[];
  expenses: any[];
  assets: any[];
  volunteers: any[];
  grants: any[];
  contentCalendar: any[];
}

export const defaultState: AppState = {
  tasks: [],
  projects: [],
  clients: [],
  invoices: [],
  expenses: [],
  assets: [],
  volunteers: [],
  grants: [],
  contentCalendar: []
};

function getStorage(): AppState {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return defaultState;
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultState;
  }
}

function setStorage(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const mockApi = {
  async getCollection<K extends keyof AppState>(key: K): Promise<AppState[K]> {
    await delay(300);
    return getStorage()[key];
  },
  async setCollection<K extends keyof AppState>(key: K, data: AppState[K]): Promise<AppState[K]> {
    await delay(300);
    const state = getStorage();
    state[key] = data;
    setStorage(state);
    return data;
  }
};
