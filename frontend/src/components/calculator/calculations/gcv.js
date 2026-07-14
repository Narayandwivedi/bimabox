import TARIFF from '../tariffData'

export function calcGcv({
  gvwVal, isElectric,
  vehicleAge, zone,
}) {
  const brackets = [7500, 12000, 20000, 40000, Infinity]
  const idx = brackets.findIndex(b => gvwVal <= b)
  const gvwIdx = idx >= 0 ? idx : 4
  const tpArr = isElectric ? TARIFF.gcv.electricTpByGVW : TARIFF.gcv.tpByGVW
  const gcvBaseTP = tpArr[gvwIdx]
  const gcvExtraUnits = gvwVal > 12000 ? Math.floor((gvwVal - 12000) / 100) : 0
  const gcvExtraPremium = gcvExtraUnits * TARIFF.gcv.extraPer100kg

  return {
    tpPremium: gcvBaseTP,
    odRate: TARIFF.gcv.odRates[vehicleAge][zone],
    details: {
      label: `GVW ${gvwVal} kg${isElectric ? ' (Electric)' : ''}`,
      gcvBaseTP, gcvExtraUnits, gcvExtraPremium,
    },
  }
}
