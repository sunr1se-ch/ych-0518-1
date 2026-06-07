import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useStore } from '@/store/useStore';
import { getAspectColor } from '@/utils/format';

export default function NeighborDiffScatterChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { neighborDiffs } = useStore();

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const aspects = Array.from(new Set(neighborDiffs.map(d => d.aspect)));
    
    const series = aspects.map(aspect => {
      const data = neighborDiffs
        .filter(d => d.aspect === aspect)
        .map(d => [
          d.altitudeDiff,
          d.thicknessDiff,
          `${d.profileNo1}-${d.profileNo2}`,
          d.thickness1,
          d.thickness2,
        ]);

      return {
        name: aspect,
        type: 'scatter',
        data,
        symbolSize: 15,
        itemStyle: {
          color: getAspectColor(aspect),
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      };
    });

    const maxAltitudeDiff = Math.max(...neighborDiffs.map(d => Math.abs(d.altitudeDiff)), 1);
    const maxThicknessDiff = Math.max(...neighborDiffs.map(d => Math.abs(d.thicknessDiff)), 1);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const d = params.data;
          return `
            <div class="font-medium">${d[2]}</div>
            <div>坡向：${params.seriesName}</div>
            <div>海拔差：<span class="font-bold">${d[0]}m</span></div>
            <div>厚度差：<span class="font-bold ${d[1] >= 0 ? 'text-accent-500' : 'text-primary-600'}">${d[1] >= 0 ? '+' : ''}${d[1]}cm</span></div>
            <div class="text-gray-400 text-xs mt-1">${d[2].split('-')[0]}: ${d[3]}cm | ${d[2].split('-')[1]}: ${d[4]}cm</div>
          `;
        },
      },
      legend: {
        data: aspects,
        top: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 12, color: '#6b7280' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '海拔差(m)',
        nameTextStyle: { color: '#6b7280', fontSize: 12 },
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
        min: 0,
        max: Math.ceil(maxAltitudeDiff / 50) * 50 + 50,
      },
      yAxis: {
        type: 'value',
        name: '活动层厚度差(cm)',
        nameTextStyle: { color: '#6b7280', fontSize: 12 },
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
        min: -Math.ceil(maxThicknessDiff / 5) * 5 - 2,
        max: Math.ceil(maxThicknessDiff / 5) * 5 + 2,
      },
      series: series as echarts.EChartsOption['series'],
      animationDuration: 800,
    };

    chartInstance.current.setOption(option, true);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [neighborDiffs]);

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">邻剖面活动层厚度差值散点图</h3>
          <p className="text-sm text-gray-500 mt-1">同坡向相邻海拔剖面对比</p>
        </div>
      </div>
      <div ref={chartRef} className="w-full h-80" />
    </div>
  );
}
