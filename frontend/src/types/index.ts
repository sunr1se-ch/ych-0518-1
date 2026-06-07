export interface Profile {
  id: string;
  profileNo: string;
  altitude: number;
  aspect: string;
  createdAt?: string;
}

export interface Sample {
  id: string;
  profileNo: string;
  sampleDate: string;
  activeLayerThickness: number;
  temp20cm: number;
  temp50cm: number;
  createdAt?: string;
}

export interface DailyStats {
  profileNo: string;
  date: string;
  avgThickness: number;
  avgTempDiff: number;
}

export interface ProfileStats {
  profileNo: string;
  aspect: string;
  altitude: number;
  periodAvgThickness: number;
  periodAvgTempDiff: number;
  sampleCount: number;
}

export interface NeighborDiff {
  profileNo1: string;
  profileNo2: string;
  aspect: string;
  altitudeDiff: number;
  thicknessDiff: number;
  altitude1: number;
  altitude2: number;
  thickness1: number;
  thickness2: number;
}

export interface FilterParams {
  aspects: string[];
  startDate: string;
  endDate: string;
}

export interface SummaryData {
  profileCount: number;
  avgThickness: number;
  avgTempDiff: number;
  totalSamples: number;
}

export interface DateRange {
  minDate: string;
  maxDate: string;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}
