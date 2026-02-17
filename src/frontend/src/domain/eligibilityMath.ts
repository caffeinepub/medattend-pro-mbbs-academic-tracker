// Smart deficit and safe margin calculations

export function calculateClassesNeeded(
  attended: number,
  conducted: number,
  threshold: number
): number {
  if (conducted === 0) return 0;
  
  const currentPercentage = (attended / conducted) * 100;
  if (currentPercentage >= threshold) return 0;
  
  // Need to find N such that (attended + N) / (conducted + N) >= threshold / 100
  // Solving: attended + N >= threshold/100 * (conducted + N)
  // attended + N >= threshold/100 * conducted + threshold/100 * N
  // N - threshold/100 * N >= threshold/100 * conducted - attended
  // N * (1 - threshold/100) >= threshold/100 * conducted - attended
  // N >= (threshold/100 * conducted - attended) / (1 - threshold/100)
  
  const numerator = (threshold / 100) * conducted - attended;
  const denominator = 1 - threshold / 100;
  
  return Math.ceil(numerator / denominator);
}

export function calculateSafeMisses(
  attended: number,
  conducted: number,
  threshold: number
): number {
  if (conducted === 0) return 0;
  
  const currentPercentage = (attended / conducted) * 100;
  if (currentPercentage < threshold) return 0;
  
  // Find N such that attended / (conducted + N) >= threshold / 100
  // attended >= threshold/100 * (conducted + N)
  // attended >= threshold/100 * conducted + threshold/100 * N
  // attended - threshold/100 * conducted >= threshold/100 * N
  // N <= (attended - threshold/100 * conducted) / (threshold/100)
  
  const numerator = attended - (threshold / 100) * conducted;
  const denominator = threshold / 100;
  
  return Math.floor(numerator / denominator);
}
