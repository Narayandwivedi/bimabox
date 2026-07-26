import TARIFF from '../tariffData'
import { getCCBracket } from './helpers'

export function calcPrivateCar({
  isElectric, kwVal, ccVal,
  policyType, bundleTpTerm,
  vehicleAge, zone,
}, config) {
  const tpRates = config?.tpRates || TARIFF.private_car
  const odRates = config?.odRates || TARIFF.private_car.odRates

  if (isElectric) {
    const kwBracket = kwVal < 30 ? 0 : kwVal <= 65 ? 1 : 2
    let tpPremium
    if (policyType === 'bundle') {
      const tpYr = parseInt(bundleTpTerm) || 3
      const electricTP3yr = tpRates.electricTP3yr || TARIFF.private_car.electricTP3yr
      const electricTP1yr = tpRates.electricTP1yr || TARIFF.private_car.electricTP1yr
      tpPremium = electricTP3yr[kwBracket]
      if (tpYr !== 3) tpPremium = electricTP1yr[kwBracket] * tpYr
    } else {
      const electricTP1yr = tpRates.electricTP1yr || TARIFF.private_car.electricTP1yr
      tpPremium = electricTP1yr[kwBracket]
    }
    return {
      tpPremium,
      odRate: odRates[vehicleAge][zone][kwBracket],
      details: { label: `${kwVal} KW (Electric)` },
    }
  }

  const bracket = getCCBracket(ccVal)
  let tpPremium
  if (policyType === 'bundle') {
    const tpYr = parseInt(bundleTpTerm) || 3
    const tp3YrsByCC = tpRates.tp3YrsByCC || TARIFF.private_car.tp3YrsByCC
    const tpByCC = tpRates.tpByCC || TARIFF.private_car.tpByCC
    tpPremium = tp3YrsByCC[bracket]
    if (tpYr !== 3) tpPremium = tpByCC[bracket] * tpYr
  } else {
    const tpByCC = tpRates.tpByCC || TARIFF.private_car.tpByCC
    tpPremium = tpByCC[bracket]
  }
  return {
    tpPremium,
    odRate: odRates[vehicleAge][zone][bracket],
    details: { label: ccVal <= 1000 ? '≤1000 CC' : ccVal <= 1500 ? '1001–1500 CC' : '>1500 CC' },
  }
}
