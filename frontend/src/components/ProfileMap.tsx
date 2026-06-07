import { useStore } from '@/store/useStore';
import { getAspectColor, sortByAspectAndAltitude, ASPECT_ORDER } from '@/utils/format';
import { MapPin, Mountain } from 'lucide-react';

export default function ProfileMap() {
  const { profiles, filters } = useStore();

  const filteredProfiles = filters.aspects.length > 0
    ? profiles.filter(p => filters.aspects.includes(p.aspect))
    : profiles;

  const sortedProfiles = sortByAspectAndAltitude(filteredProfiles);

  const aspectGroups = ASPECT_ORDER.reduce((acc, aspect) => {
    const group = sortedProfiles.filter(p => p.aspect === aspect);
    if (group.length > 0) {
      acc[aspect] = group;
    }
    return acc;
  }, {} as Record<string, typeof sortedProfiles>);

  const allAltitudes = sortedProfiles.map(p => p.altitude);
  const minAlt = allAltitudes.length > 0 ? Math.min(...allAltitudes) - 50 : 4000;
  const maxAlt = allAltitudes.length > 0 ? Math.max(...allAltitudes) + 50 : 5000;

  const getYPosition = (altitude: number) => {
    const range = maxAlt - minAlt;
    if (range === 0) return 50;
    return 100 - ((altitude - minAlt) / range) * 85 - 10;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-700" />
          <h3 className="text-lg font-bold text-gray-800">剖面布设示意图</h3>
        </div>
        <p className="text-sm text-gray-500">按坡向分组 · 海拔排序</p>
      </div>

      <div className="relative h-80 bg-gradient-to-b from-sky-50 to-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="absolute top-2 left-2 text-xs text-gray-500 flex items-center gap-1">
          <Mountain className="w-3 h-3" />
          海拔(m)
        </div>

        {[0, 25, 50, 75, 100].map((pos, i) => {
          const alt = Math.round(maxAlt - (pos / 100) * (maxAlt - minAlt));
          return (
            <div
              key={i}
              className="absolute left-14 right-4 border-t border-dashed border-gray-200"
              style={{ top: `${pos}%` }}
            >
              <span className="absolute -left-12 -top-2 text-xs text-gray-400 font-mono">
                {alt}
              </span>
            </div>
          );
        })}

        <div className="absolute bottom-0 left-0 right-0 flex h-full px-16 pt-8">
          {Object.entries(aspectGroups).map(([aspect, group]) => (
            <div
              key={aspect}
              className="flex-1 relative border-l border-gray-100 last:border-r"
            >
              <div
                className="absolute top-2 left-0 right-0 text-center font-bold text-sm px-2 py-1 rounded mx-2"
                style={{ backgroundColor: getAspectColor(aspect) + '20', color: getAspectColor(aspect) }}
              >
                {aspect}
              </div>

              {group.map((profile, idx) => {
                const yPos = getYPosition(profile.altitude);
                return (
                  <div
                    key={profile.id}
                    className="absolute left-0 right-0 flex items-center justify-center"
                    style={{ top: `${yPos}%` }}
                  >
                    <div
                      className="group relative flex items-center justify-center cursor-pointer"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: getAspectColor(aspect) }}
                      >
                        {profile.profileNo.slice(1)}
                      </div>
                      <div className="absolute -right-16 text-xs font-mono text-gray-600 whitespace-nowrap">
                        {profile.altitude}m
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        <div className="font-bold">{profile.profileNo}</div>
                        <div>坡向：{aspect}</div>
                        <div>海拔：{profile.altitude}m</div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                      </div>
                    </div>
                    {idx < group.length - 1 && (
                      <div
                        className="absolute left-1/2 w-0.5 bg-gray-200"
                        style={{
                          top: `${getYPosition(profile.altitude)}%`,
                          height: `${getYPosition(group[idx + 1].altitude) - getYPosition(profile.altitude)}%`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {sortedProfiles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            暂无数据
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {Object.keys(aspectGroups).map(aspect => (
          <div key={aspect} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getAspectColor(aspect) }}
            />
            <span className="text-sm text-gray-600">{aspect}</span>
            <span className="text-xs text-gray-400">({aspectGroups[aspect].length}个剖面)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
