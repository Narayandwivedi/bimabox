import TARIFF from '../tariffData'

export function calcGcv({
  gvwVal, isElectric,
  vehicleAge, zone,
}, config) {
  const brackets = [7500, 12000, 20000, 40000, Infinity]
  const idx = brackets.findIndex(b => gvwVal <= b)
  const gvwIdx = idx >= 0 ? idx : 4

  const tpRates = config?.tpRates || TARIFF.gcv
  const odRates = config?.odRates || TARIFF.gcv.odRates
  const extraRates = config?.extraRates || TARIFF.gcv

  const tpArr = isElectric ? (tpRates.electricTpByGVW || TARIFF.gcv.electricTpByGVW) : (tpRates.tpByGVW || TARIFF.gcv.tpByGVW)
  const gcvBaseTP = tpArr[gvwIdx]
  const gcvExtraUnits = gvwVal > 12000 ? Math.floor((gvwVal - 12000) / 100) : 0
  const extraPer100kg = extraRates.extraPer100kg ?? TARIFF.gcv.extraPer100kg
  const gcvExtraPremium = gcvExtraUnits * extraPer100kg

  return {
    tpPremium: gcvBaseTP,
    odRate: odRates[vehicleAge][zone],
    details: {
      label: `GVW ${gvwVal} kg${isElectric ? ' (Electric)' : ''}`,
      gcvBaseTP, gcvExtraUnits, gcvExtraPremium,
    },
  }
}
