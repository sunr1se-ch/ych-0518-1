import type {
  Profile,
  DailyStats,
  ProfileStats,
  NeighborDiff,
  FilterParams,
  SummaryData,
  DateRange,
  ApiResponse,
  ImportResult,
} from '@/types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }
  return data.data;
}

export function buildQueryString(params: Partial<FilterParams>): string {
  const searchParams = new URLSearchParams();
  
  if (params.aspects && params.aspects.length > 0) {
    params.aspects.forEach(aspect => {
      searchParams.append('aspects', aspect);
    });
  }
  if (params.startDate) {
    searchParams.append('startDate', params.startDate);
  }
  if (params.endDate) {
    searchParams.append('endDate', params.endDate);
  }
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const api = {
  getAspects: (): Promise<string[]> => 
    request<string[]>('/aspects'),

  getDateRange: (): Promise<DateRange> =>
    request<DateRange>('/date-range'),

  getProfiles: (params?: Partial<FilterParams>): Promise<Profile[]> =>
    request<Profile[]>(`/profiles${buildQueryString(params || {})}`),

  getSummary: (params?: Partial<FilterParams>): Promise<SummaryData> =>
    request<SummaryData>(`/statistics/summary${buildQueryString(params || {})}`),

  getDailyStats: (params?: Partial<FilterParams>): Promise<{ profileStats: ProfileStats[]; dailyData: DailyStats[] }> =>
    request<{ profileStats: ProfileStats[]; dailyData: DailyStats[] }>(
      `/statistics/daily${buildQueryString(params || {})}`
    ),

  getNeighborDiff: (params?: Partial<FilterParams>): Promise<NeighborDiff[]> =>
    request<NeighborDiff[]>(`/statistics/neighbor-diff${buildQueryString(params || {})}`),

  importSamples: (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return request<ImportResult>('/samples/import', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  exportData: (params?: Partial<FilterParams>): void => {
    const url = `${API_BASE}/export${buildQueryString(params || {})}`;
    window.open(url, '_blank');
  },
};
