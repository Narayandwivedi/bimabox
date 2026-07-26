import TARIFF from '../tariffData'

export function calcPcv({
  subtype, passengerVal,
  vehicleAge, zone,
}, config) {
  const subtypes = config?.subtypes || TARIFF.pcv.subtypes
  const odRates = config?.odRates || TARIFF.pcv.odRates
  const addOD = config?.addOD || TARIFF.pcv.addOD

  const st = subtypes.find(s => s.id === subtype) || subtypes[0]
  const addODEntry = addOD.find(a => passengerVal <= a.maxPsgr)
  const addODVal = addODEntry?.extra || 350
  return {
    tpPremium: st.tpBase + (passengerVal * st.tpPerPsgr),
    odRate: odRates[vehicleAge][zone],
    addODVal,
    details: {
      label: st.label,
      tpBase: st.tpBase,
      tpPsgr: passengerVal * st.tpPerPsgr,
      addOD: addODVal,
    },
  }
}
