import { create } from 'zustand';
import type { FilterParams, ProfileStats, DailyStats, NeighborDiff, SummaryData, Profile } from '@/types';
import { api } from '@/services/api';

interface AppState {
  aspects: string[];
  profiles: Profile[];
  profileStats: ProfileStats[];
  dailyData: DailyStats[];
  neighborDiffs: NeighborDiff[];
  summary: SummaryData;
  filters: FilterParams;
  minDate: string;
  maxDate: string;
  loading: boolean;
  error: string | null;
  
  setFilters: (filters: Partial<FilterParams>) => void;
  loadInitialData: () => Promise<void>;
  loadChartData: () => Promise<void>;
  toggleAspect: (aspect: string) => void;
}

const initialSummary: SummaryData = {
  profileCount: 0,
  avgThickness: 0,
  avgTempDiff: 0,
  totalSamples: 0,
};

export const useStore = create<AppState>((set, get) => ({
  aspects: [],
  profiles: [],
  profileStats: [],
  dailyData: [],
  neighborDiffs: [],
  summary: initialSummary,
  filters: {
    aspects: [],
    startDate: '',
    endDate: '',
  },
  minDate: '',
  maxDate: '',
  loading: false,
  error: null,

  setFilters: (filters: Partial<FilterParams>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  toggleAspect: (aspect: string) => {
    set(state => {
      const currentAspects = state.filters.aspects;
      const newAspects = currentAspects.includes(aspect)
        ? currentAspects.filter(a => a !== aspect)
        : [...currentAspects, aspect];
      return {
        filters: { ...state.filters, aspects: newAspects },
      };
    });
  },

  loadInitialData: async () => {
    set({ loading: true, error: null });
    try {
      const [aspects, dateRange, profiles] = await Promise.all([
        api.getAspects(),
        api.getDateRange(),
        api.getProfiles(),
      ]);
      
      set({
        aspects,
        profiles,
        minDate: dateRange.minDate || '',
        maxDate: dateRange.maxDate || '',
        filters: {
          aspects: [],
          startDate: dateRange.minDate || '',
          endDate: dateRange.maxDate || '',
        },
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载数据失败' });
    } finally {
      set({ loading: false });
    }
  },

  loadChartData: async () => {
    set({ loading: true, error: null });
    const { filters } = get();
    try {
      const [stats, neighborDiffs, summary] = await Promise.all([
        api.getDailyStats(filters),
        api.getNeighborDiff(filters),
        api.getSummary(filters),
      ]);
      
      set({
        profileStats: stats.profileStats,
        dailyData: stats.dailyData,
        neighborDiffs,
        summary,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载图表数据失败' });
    } finally {
      set({ loading: false });
    }
  },
}));
