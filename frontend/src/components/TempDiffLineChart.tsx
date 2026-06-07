import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useStore } from '@/store/useStore';
import { getAspectColor, sortByAspectAndAltitude } from '@/utils/format';

export default function TempDiffLineChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { dailyData, profileStats } = useStore();

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const sortedProfiles = sortByAspectAndAltitude(profileStats);
    const profileNos = sortedProfiles.map(p => p.profileNo);
    
    const dates = Array.from(new Set(dailyData.map(d => d.date))).sort();
    
    const series = profileNos.map(profileNo => {
      const profile = sortedProfiles.find(p => p.profileNo === profileNo)!;
      const data = dates.map(date => {
        const record = dailyData.find(d => d.profileNo === profileNo && d.date === date);
        return record ? record.avgTempDiff : null;
      });
      
      return {
        name: `${profileNo} (${profile.aspect})`,
        type: 'line',
        data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: getAspectColor(profile.aspect),
        },
        itemStyle: {
          color: getAspectColor(profile.aspect),
        },
      };
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let html = `<div class="font-medium mb-1">${params[0].axisValue}</div>`;
          params.forEach((p: any) => {
            if (p.value !== null && p.value !== undefined) {
              html += `<div style="color:${p.color}">${p.marker}${p.seriesName}: <span class="font-bold">${p.value}℃</span></div>`;
            }
          });
          return html;
        },
      },
      legend: {
        type: 'scroll',
        bottom: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 11, color: '#6b7280' },
        pageTextStyle: { color: '#6b7280' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '18%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates.map(d => {
          const date = new Date(d);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        axisLabel: { color: '#6b7280', fontSize: 10 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        name: '地温差(℃)',
        nameTextStyle: { color: '#6b7280', fontSize: 12 },
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
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
  }, [dailyData, profileStats]);

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">地温差(50cm-20cm)日均值趋势</h3>
          <p className="text-sm text-gray-500 mt-1">不同剖面地温梯度变化</p>
        </div>
      </div>
      <div ref={chartRef} className="w-full h-80" />
    </div>
  );
}
