import TARIFF from '../tariffData'

export function calcPcv3w({
  subtype, passengerVal,
  vehicleAge, zone,
}, config) {
  const subtypes = config?.subtypes || TARIFF.pcv_3w.subtypes
  const odRates = config?.odRates || TARIFF.pcv_3w.odRates

  const st = subtypes.find(s => s.id === subtype) || subtypes[0]
  return {
    tpPremium: st.tpBase + (passengerVal * st.tpPerPsgr),
    odRate: odRates[vehicleAge][zone],
    details: {
      label: st.label,
      tpBase: st.tpBase,
      tpPsgr: passengerVal * st.tpPerPsgr,
    },
  }
}
