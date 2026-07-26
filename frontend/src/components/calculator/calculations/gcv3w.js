import TARIFF from '../tariffData'

export function calcGcv3w({
  subtype,
  vehicleAge, zone,
}, config) {
  const subtypes = config?.subtypes || TARIFF.gcv_3w.subtypes
  const odRates = config?.odRates || TARIFF.gcv_3w.odRates

  const st = subtypes.find(s => s.id === subtype) || subtypes[0]
  return {
    tpPremium: st.tp,
    odRate: odRates[vehicleAge][zone],
    details: { label: st.label },
  }
}
