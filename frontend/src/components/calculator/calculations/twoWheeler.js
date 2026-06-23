import TARIFF from '../tariffData'
import { get2WCCBracket, get2WODBracket } from './helpers'

export function calcTwoWheeler({
  isElectric, kwVal, ccVal,
  policyType, policyTerm, bundleTpTerm,
  vehicleAge, zone,
}) {
  if (isElectric) {
    const kwBracket = kwVal < 3 ? 0 : kwVal <= 7 ? 1 : kwVal <= 16 ? 2 : 3
    let tpPremium
    if (policyType === 'bundle') {
      tpPremium = TARIFF.two_wheeler.electricTP5yr[kwBracket] || 0
    } else if (policyType === 'od') {
      tpPremium = 0
    } else {
      tpPremium = TARIFF.two_wheeler.electricTP1yr[kwBracket] || 0
    }
    return {
      tpPremium,
      odRate: TARIFF.two_wheeler.odRates[vehicleAge]?.[zone]?.[kwBracket >= 3 ? 2 : kwBracket] || 0,
      details: { label: `${kwVal} KW (Electric)` },
    }
  }

  const ccBracket = get2WCCBracket(ccVal)
  const odBracket = get2WODBracket(ccVal)
  let tpPremium
  if (policyTerm === '5yr' || policyType === 'bundle') {
    const tpYr = parseInt(bundleTpTerm) || 5
    tpPremium = TARIFF.two_wheeler.tpBundle5yr[ccBracket] || 0
    if (tpYr !== 5) tpPremium = TARIFF.two_wheeler.tpByCC[ccBracket] * tpYr
  } else {
    tpPremium = TARIFF.two_wheeler.tpByCC[ccBracket]
  }
  return {
    tpPremium,
    odRate: TARIFF.two_wheeler.odRates[vehicleAge][zone][odBracket],
    details: { label: ccVal <= 75 ? '≤75 CC' : ccVal <= 150 ? '76–150 CC' : ccVal <= 350 ? '151–350 CC' : '>350 CC' },
  }
}
