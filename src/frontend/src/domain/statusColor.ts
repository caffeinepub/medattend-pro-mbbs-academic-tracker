// Status color classification (Green/Yellow/Red)

export type StatusColor = 'green' | 'yellow' | 'red';

export function getStatusColor(percentage: number, threshold: number): StatusColor {
  if (percentage < threshold) return 'red';
  if (percentage < threshold + 5) return 'yellow';
  return 'green';
}

export function getStatusLabel(percentage: number, threshold: number): string {
  const status = getStatusColor(percentage, threshold);
  if (status === 'green') return 'Safe';
  if (status === 'yellow') return 'Borderline';
  return 'Shortage';
}
