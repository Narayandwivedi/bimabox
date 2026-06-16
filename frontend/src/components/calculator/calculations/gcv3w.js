import TARIFF from '../tariffData'

export function calcGcv3w({
  subtype,
  vehicleAge, zone,
}) {
  const st = TARIFF.gcv_3w.subtypes.find(s => s.id === subtype) || TARIFF.gcv_3w.subtypes[0]
  return {
    tpPremium: st.tp,
    odRate: TARIFF.gcv_3w.odRates[vehicleAge][zone],
    details: { label: st.label },
  }
}
