export const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n || 0))

export const fmtShort = (n) => {
  const a = Math.abs(n || 0)
  if (a >= 10000000) return (a / 10000000).toFixed(1) + 'Cr'
  if (a >= 100000)   return (a / 100000).toFixed(1) + 'L'
  if (a >= 1000)     return (a / 1000).toFixed(1) + 'K'
  return a.toFixed(0)
}

export const fmtDate = (d) => {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return d }
}

export const fmtMonth = (m) => {
  try {
    return new Date(m + '-01').toLocaleDateString('en-IN', {
      month: 'long', year: 'numeric',
    })
  } catch { return m }
}

export const fmtMonthShort = (m) => {
  try {
    return new Date(m + '-01').toLocaleDateString('en-IN', {
      month: 'short', year: '2-digit',
    })
  } catch { return m }
}

export const today = () => new Date().toISOString().slice(0, 10)
export const thisMonth = () => new Date().toISOString().slice(0, 7)
export const thisYear  = () => new Date().getFullYear()
