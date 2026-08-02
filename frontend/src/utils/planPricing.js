// Mirrors the pricing rules on the backend (backend/utils/planConfig.js).
// Base price is the quarterly (3-month) price; 6/9/12 months scale linearly
// and 12-month (1-year) plans get a 10% discount.

export const DURATION_OPTIONS = [
  { months: 3, label: '3 Months' },
  { months: 6, label: '6 Months' },
  { months: 9, label: '9 Months' },
  { months: 12, label: '1 Year' },
]

export const MONTHS_TO_DAYS = 30
export const ANNUAL_DISCOUNT = 0.1

export const computeDurationDays = (months) => {
  const m = Number(months) || 3
  return m * MONTHS_TO_DAYS
}

export const computePlanPrice = (plan, months) => {
  const m = Number(months) || 3
  const base = Number(plan?.price) || 0
  const gross = base * (m / 3)
  const discount = m === 12 ? ANNUAL_DISCOUNT : 0
  const net = gross * (1 - discount)
  return {
    base,
    gross,
    discount,
    net: Math.round(net * 100) / 100,
    savings: Math.round((gross - net) * 100) / 100,
  }
}

export const formatINR = (value) => {
  const rounded = Math.round(Number(value) * 100) / 100
  const whole = Math.floor(rounded)
  const hasPaise = rounded - whole > 0.004
  if (hasPaise) {
    return `₹${rounded.toFixed(2)}`
  }
  return `₹${whole}`
}
