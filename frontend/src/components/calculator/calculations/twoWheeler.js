import TARIFF from '../tariffData'
import { get2WCCBracket, get2WODBracket } from './helpers'

export function calcTwoWheeler({
  isElectric, kwVal, ccVal,
  policyType, policyTerm, bundleTpTerm,
  vehicleAge, zone,
}, config) {
  const tpRates = config?.tpRates || TARIFF.two_wheeler
  const odRates = config?.odRates || TARIFF.two_wheeler.odRates

  if (isElectric) {
    const kwBracket = kwVal <= 3 ? 0 : kwVal <= 7 ? 1 : kwVal <= 16 ? 2 : 3
    const electricOdBracket = kwVal <= 7 ? 0 : kwVal <= 16 ? 1 : 2
    let tpPremium
    const electricTP5yr = tpRates.electricTP5yr || TARIFF.two_wheeler.electricTP5yr
    const electricTP1yr = tpRates.electricTP1yr || TARIFF.two_wheeler.electricTP1yr

    if (policyType === 'bundle') {
      tpPremium = electricTP5yr[kwBracket] || 0
    } else if (policyType === 'od') {
      tpPremium = 0
    } else {
      tpPremium = electricTP1yr[kwBracket] || 0
    }
    return {
      tpPremium,
      odRate: odRates[vehicleAge]?.[zone]?.[electricOdBracket] || 0,
      details: { label: kwVal <= 3 ? '≤3 KW' : kwVal <= 7 ? '3–7 KW' : kwVal <= 16 ? '7–16 KW' : '>16 KW' },
    }
  }

  const ccBracket = get2WCCBracket(ccVal)
  const odBracket = get2WODBracket(ccVal)
  let tpPremium
  const tpBundle5yr = tpRates.tpBundle5yr || TARIFF.two_wheeler.tpBundle5yr
  const tpByCC = tpRates.tpByCC || TARIFF.two_wheeler.tpByCC

  if (policyTerm === '5yr' || policyType === 'bundle') {
    const tpYr = parseInt(bundleTpTerm) || 5
    tpPremium = tpBundle5yr[ccBracket] || 0
    if (tpYr !== 5) tpPremium = tpByCC[ccBracket] * tpYr
  } else {
    tpPremium = tpByCC[ccBracket]
  }
  return {
    tpPremium,
    odRate: odRates[vehicleAge][zone][odBracket],
    details: { label: ccVal <= 75 ? '≤75 CC' : ccVal <= 150 ? '76–150 CC' : ccVal <= 350 ? '151–350 CC' : '>350 CC' },
  }
}
