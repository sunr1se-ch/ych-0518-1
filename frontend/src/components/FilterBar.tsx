import { RefreshCw, Download, Upload, Calendar, Mountain } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';
import { getAspectColor } from '@/utils/format';

export default function FilterBar() {
  const {
    aspects,
    filters,
    minDate,
    maxDate,
    loading,
    toggleAspect,
    setFilters,
    loadChartData,
  } = useStore();

  const handleApply = () => {
    loadChartData();
  };

  const handleExport = () => {
    api.exportData(filters);
  };

  const handleReset = () => {
    setFilters({
      aspects: [],
      startDate: minDate,
      endDate: maxDate,
    });
    setTimeout(() => loadChartData(), 100);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-primary-700" />
          <span className="font-semibold text-gray-700">坡向筛选：</span>
          <div className="flex flex-wrap gap-2">
            {aspects.map((aspect) => (
              <button
                key={aspect}
                onClick={() => toggleAspect(aspect)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border-2 ${
                  filters.aspects.includes(aspect)
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  backgroundColor: filters.aspects.includes(aspect) ? getAspectColor(aspect) : undefined,
                  borderColor: filters.aspects.includes(aspect) ? getAspectColor(aspect) : undefined,
                }}
              >
                {aspect}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-700" />
          <span className="font-semibold text-gray-700">日期：</span>
          <input
            type="date"
            value={filters.startDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setFilters({ startDate: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <span className="text-gray-400">至</span>
          <input
            type="date"
            value={filters.endDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setFilters({ endDate: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleApply}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors disabled:opacity-50 font-medium text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            查询
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            重置
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
          <Link
            to="/import"
            className="flex items-center gap-2 px-4 py-2 bg-glacier-500 text-white rounded-md hover:bg-glacier-600 transition-colors font-medium text-sm"
          >
            <Upload className="w-4 h-4" />
            导入
          </Link>
        </div>
      </div>
    </div>
  );
}
