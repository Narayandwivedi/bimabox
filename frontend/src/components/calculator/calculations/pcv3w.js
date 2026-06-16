import TARIFF from '../tariffData'

export function calcPcv3w({
  subtype, passengerVal,
  vehicleAge, zone,
}) {
  const st = TARIFF.pcv_3w.subtypes.find(s => s.id === subtype) || TARIFF.pcv_3w.subtypes[0]
  return {
    tpPremium: st.tpBase + (passengerVal * st.tpPerPsgr),
    odRate: TARIFF.pcv_3w.odRates[vehicleAge][zone],
    details: {
      label: st.label,
      tpBase: st.tpBase,
      tpPsgr: passengerVal * st.tpPerPsgr,
    },
  }
}
