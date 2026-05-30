export function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

export function formatDate(daysAgo: number): string {
  if (daysAgo === 0) return '今天'
  if (daysAgo < 7) return `${daysAgo}天前`
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}周前`
  return `${Math.floor(daysAgo / 30)}个月前`
}
