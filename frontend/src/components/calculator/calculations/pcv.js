import TARIFF from '../tariffData'

export function calcPcv({
  subtype, passengerVal,
  vehicleAge, zone,
}) {
  const st = TARIFF.pcv.subtypes.find(s => s.id === subtype) || TARIFF.pcv.subtypes[0]
  const addODEntry = TARIFF.pcv.addOD.find(a => passengerVal <= a.maxPsgr)
  const addODVal = addODEntry?.extra || 350
  return {
    tpPremium: st.tpBase + (passengerVal * st.tpPerPsgr),
    odRate: TARIFF.pcv.odRates[vehicleAge][zone],
    addODVal,
    details: {
      label: st.label,
      tpBase: st.tpBase,
      tpPsgr: passengerVal * st.tpPerPsgr,
      addOD: addODVal,
    },
  }
}
