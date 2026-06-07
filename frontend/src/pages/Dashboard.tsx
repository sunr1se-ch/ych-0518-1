import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import FilterBar from '@/components/FilterBar';
import StatsCards from '@/components/StatsCards';
import ThicknessBarChart from '@/components/ThicknessBarChart';
import TempDiffLineChart from '@/components/TempDiffLineChart';
import NeighborDiffScatterChart from '@/components/NeighborDiffScatterChart';
import ProfileMap from '@/components/ProfileMap';
import { Loader2, AlertCircle, Snowflake } from 'lucide-react';

export default function Dashboard() {
  const { loading, error, loadInitialData, loadChartData, filters } = useStore();

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      loadChartData();
    }
  }, [filters.aspects, filters.startDate, filters.endDate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Snowflake className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">青藏高原草甸科考点</h1>
              <p className="text-primary-100 text-sm">冻土活动层厚度与地温梯度剖面对比看板</p>
            </div>
          </div>
        </div>
      </header>

      <FilterBar />

      <main className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-blue-700">
            <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
            <span>数据加载中...</span>
          </div>
        )}

        <div className="space-y-6">
          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThicknessBarChart />
            <TempDiffLineChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeighborDiffScatterChart />
            <ProfileMap />
          </div>
        </div>
      </main>

      <footer className="mt-8 py-4 text-center text-sm text-gray-400 border-t border-gray-200">
        <p>© 2024 青藏高原草甸科考点 · 冻土监测系统</p>
      </footer>
    </div>
  );
}
