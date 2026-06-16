import TARIFF from '../tariffData'

export function calcMiscD({
  subtype,
  vehicleAge, zone,
}) {
  const st = TARIFF.misc_d.subtypes.find(s => s.id === subtype) || TARIFF.misc_d.subtypes[0]
  return {
    tpPremium: st.tp,
    odRate: TARIFF.misc_d.odRates[vehicleAge][zone],
    details: { label: st.label },
  }
}
