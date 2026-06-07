import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useStore } from '@/store/useStore';
import { getAspectColor, sortByAspectAndAltitude } from '@/utils/format';

export default function ThicknessBarChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { profileStats } = useStore();

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const sortedStats = sortByAspectAndAltitude(profileStats);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          const stat = sortedStats[data.dataIndex];
          return `
            <div class="font-medium">${stat.profileNo}</div>
            <div>坡向：${stat.aspect}</div>
            <div>海拔：${stat.altitude}m</div>
            <div>平均厚度：<span class="font-bold text-accent-500">${stat.periodAvgThickness}cm</span></div>
            <div>采样数：${stat.sampleCount}</div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedStats.map(s => `${s.profileNo}\n${s.aspect}`),
        axisLabel: {
          interval: 0,
          fontSize: 11,
          color: '#6b7280',
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        name: '活动层厚度(cm)',
        nameTextStyle: { color: '#6b7280', fontSize: 12 },
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      series: [
        {
          type: 'bar',
          data: sortedStats.map((s, index) => ({
            value: s.periodAvgThickness,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: getAspectColor(s.aspect) },
                { offset: 1, color: getAspectColor(s.aspect) + '80' },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: '60%',
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 'bold',
            color: '#374151',
            formatter: '{c}',
          },
        },
      ],
      animationDuration: 800,
      animationEasing: 'cubicOut',
    };

    chartInstance.current.setOption(option, true);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [profileStats]);

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">各剖面活动层厚度均值对比</h3>
          <p className="text-sm text-gray-500 mt-1">按坡向和海拔排序</p>
        </div>
      </div>
      <div ref={chartRef} className="w-full h-80" />
    </div>
  );
}
