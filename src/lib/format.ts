export function formatNumber(value: unknown, maxDecimals: number): string | null {
  if (value === null || value === undefined || typeof value === 'boolean') return null
  if (typeof value === 'string' && value.trim() === '') return null

  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return null

  const decimals = Math.max(0, Math.min(20, Math.floor(maxDecimals)))
  const formatted = num.toLocaleString('pt-BR', { maximumFractionDigits: decimals })
  return formatted === '-0' ? '0' : formatted
}