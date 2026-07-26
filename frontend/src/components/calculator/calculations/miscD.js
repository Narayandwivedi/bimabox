import TARIFF from '../tariffData'

export function calcMiscD({
  subtype,
  vehicleAge, zone,
}, config) {
  const subtypes = config?.subtypes || TARIFF.misc_d.subtypes
  const odRates = config?.odRates || TARIFF.misc_d.odRates

  const st = subtypes.find(s => s.id === subtype) || subtypes[0]
  return {
    tpPremium: st.tp,
    odRate: odRates[vehicleAge][zone],
    details: { label: st.label },
  }
}
