/** 완료 기능 수 / 전체 기능 수 → 0~100 정수 (ADR-005). 항목 0개는 0 */
export function calcProgress(features: Array<{ done: boolean }>): number {
  if (features.length === 0) return 0;
  return Math.round((features.filter((f) => f.done).length / features.length) * 100);
}
