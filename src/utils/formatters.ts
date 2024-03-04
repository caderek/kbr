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
