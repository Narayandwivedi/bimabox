import TARIFF from '../tariffData'

export function calcPcv({
  subtype, passengerVal,
  vehicleAge, zone,
}) {
  const st = TARIFF.pcv.subtypes.find(s => s.id === subtype) || TARIFF.pcv.subtypes[0]
  const addODEntry = TARIFF.pcv.addOD.find(a => passengerVal <= a.maxPsgr)
  return {
    tpPremium: st.tpBase + (passengerVal * st.tpPerPsgr),
    odRate: TARIFF.pcv.odRates[vehicleAge][zone],
    details: {
      label: st.label,
      tpBase: st.tpBase,
      tpPsgr: passengerVal * st.tpPerPsgr,
      addOD: addODEntry?.extra || 350,
    },
  }
}
