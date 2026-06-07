export const ASPECT_COLORS: Record<string, string> = {
  '北坡': '#0f766e',
  '南坡': '#f97316',
  '东坡': '#0ea5e9',
  '西坡': '#7c3aed',
};

export const ASPECT_ORDER = ['北坡', '南坡', '东坡', '西坡'];

export function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatAltitude(alt: number): string {
  return `${alt}m`;
}

export function getAspectColor(aspect: string): string {
  return ASPECT_COLORS[aspect] || '#6b7280';
}

export function sortByAspectAndAltitude<T extends { aspect: string; altitude: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const aspectOrder = ASPECT_ORDER.indexOf(a.aspect) - ASPECT_ORDER.indexOf(b.aspect);
    if (aspectOrder !== 0) return aspectOrder;
    return a.altitude - b.altitude;
  });
}
