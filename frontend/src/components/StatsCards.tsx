import { Layers, Thermometer, Mountain, Ruler } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function StatsCards() {
  const { summary } = useStore();

  const cards = [
    {
      title: '监测剖面',
      value: summary.profileCount,
      unit: '个',
      icon: Mountain,
      bgGradient: 'from-primary-600 to-primary-800',
      iconBg: 'bg-primary-500/30',
    },
    {
      title: '平均活动层厚度',
      value: summary.avgThickness,
      unit: 'cm',
      icon: Ruler,
      bgGradient: 'from-accent-500 to-accent-700',
      iconBg: 'bg-accent-400/30',
    },
    {
      title: '平均地温差',
      value: summary.avgTempDiff,
      unit: '℃',
      icon: Thermometer,
      bgGradient: 'from-glacier-500 to-glacier-700',
      iconBg: 'bg-glacier-400/30',
    },
    {
      title: '采样记录',
      value: summary.totalSamples,
      unit: '条',
      icon: Layers,
      bgGradient: 'from-gray-600 to-gray-800',
      iconBg: 'bg-gray-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.bgGradient} rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">{card.title}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono">
                  {typeof card.value === 'number' ? card.value.toFixed(1) : card.value}
                </span>
                <span className="text-white/70 text-sm">{card.unit}</span>
              </div>
            </div>
            <div className={`${card.iconBg} p-3 rounded-lg`}>
              <card.icon className="w-8 h-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
