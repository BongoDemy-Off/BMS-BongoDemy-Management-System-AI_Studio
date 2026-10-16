import { Task, Project } from '../context/AppContext';
import { Client, Invoice, Expense } from '../types';
import { supabase } from './supabase';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'bongodemy_app_state_v1';

export interface AppState {
  tasks: Task[];
  projects: Project[];
  clients: Client[];
  invoices: Invoice[];
  expenses: Expense[];
  assets: unknown[];
  volunteers: unknown[];
  grants: unknown[];
  contentCalendar: unknown[];
  reportTemplates: unknown[];
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
  contentCalendar: [],
  reportTemplates: []
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
    // If Supabase is configured, use it
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('app_state')
          .select('value')
          .eq('key', key)
          .single();
          
        if (error) throw error;
        if (data) return data.value as AppState[K];
      } catch (err) {
        console.warn(`Supabase fetch failed for ${key}, falling back to localStorage:`, err);
      }
    }
    
    // Fallback to localStorage
    await delay(300);
    return getStorage()[key];
  },
  
  async setCollection<K extends keyof AppState>(key: K, data: AppState[K]): Promise<AppState[K]> {
    // If Supabase is configured, use it
    if (supabase) {
      try {
        const { error } = await supabase
          .from('app_state')
          .upsert({ key, value: data }, { onConflict: 'key' });
          
        if (error) throw error;
      } catch (err) {
        console.warn(`Supabase upsert failed for ${key}, falling back to localStorage:`, err);
      }
    }

    // Always keep localStorage in sync as a fallback
    const state = getStorage();
    state[key] = data;
    setStorage(state);
    return data;
  }
};
