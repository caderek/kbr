export function formatPercentage(num: number, precision: number = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  }).format(num)
}

export function formatNum(num: number, precision: number = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  }).format(num)
}

export function formatPercentageNice(num: number, precision: number = 0) {
  if (num === 0) {
    return "-"
  }

  if (num < 0.01) {
    return "<1"
  }

  return formatPercentage(num, precision).slice(0, -1)
}

export function formatNumNice(num: number, precision: number = 0) {
  if (num === 0) {
    return "-"
  }

  if (num < 1) {
    return "<1"
  }

  return formatNum(num, precision)
}
