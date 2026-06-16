import TARIFF from '../tariffData'
import { getCCBracket } from './helpers'

export function calcPrivateCar({
  isElectric, kwVal, ccVal,
  policyType, bundleTpTerm,
  vehicleAge, zone,
}) {
  if (isElectric) {
    const kwBracket = kwVal < 30 ? 0 : kwVal <= 65 ? 1 : 2
    let tpPremium
    if (policyType === 'bundle') {
      const tpYr = parseInt(bundleTpTerm) || 3
      tpPremium = TARIFF.private_car.electricTP3yr[kwBracket]
      if (tpYr !== 3) tpPremium = TARIFF.private_car.electricTP1yr[kwBracket] * tpYr
    } else {
      tpPremium = TARIFF.private_car.electricTP1yr[kwBracket]
    }
    return {
      tpPremium,
      odRate: TARIFF.private_car.odRates[vehicleAge][zone][kwBracket],
      details: { label: `${kwVal} KW (Electric)` },
    }
  }

  const bracket = getCCBracket(ccVal)
  let tpPremium
  if (policyType === 'bundle') {
    const tpYr = parseInt(bundleTpTerm) || 3
    tpPremium = TARIFF.private_car.tp3YrsByCC[bracket]
    if (tpYr !== 3) tpPremium = TARIFF.private_car.tpByCC[bracket] * tpYr
  } else {
    tpPremium = TARIFF.private_car.tpByCC[bracket]
  }
  return {
    tpPremium,
    odRate: TARIFF.private_car.odRates[vehicleAge][zone][bracket],
    details: { label: ccVal <= 1000 ? '≤1000 CC' : ccVal <= 1500 ? '1001–1500 CC' : '>1500 CC' },
  }
}
