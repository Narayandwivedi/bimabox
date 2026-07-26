import TARIFF from '../tariffData'
import { getCCBracket } from './helpers'

export function calcTaxi({
  isElectric, kwVal, ccVal,
  passengerVal,
  vehicleAge, zone,
}, config) {
  const tpRates = config?.tpRates || TARIFF.taxi
  const odRates = config?.odRates || TARIFF.taxi.odRates

  if (isElectric) {
    const kwBracket = kwVal <= 30 ? 0 : kwVal <= 65 ? 1 : 2
    const electricTP = tpRates.electricTP || TARIFF.taxi.electricTP
    const electricTPPerPsgr = tpRates.electricTPPerPsgr || TARIFF.taxi.electricTPPerPsgr
    return {
      tpPremium: electricTP[kwBracket] + (passengerVal * electricTPPerPsgr[kwBracket]),
      odRate: odRates[vehicleAge][zone][kwBracket],
      details: {
        label: kwVal <= 30 ? '≤30 KW' : kwVal <= 65 ? '30–65 KW' : '>65 KW',
        tpBase: electricTP[kwBracket],
        tpPsgr: passengerVal * electricTPPerPsgr[kwBracket],
      },
    }
  }

  const bracket = getCCBracket(ccVal)
  const tpByCC = tpRates.tpByCC || TARIFF.taxi.tpByCC
  const tpPerPsgr = tpRates.tpPerPsgr || TARIFF.taxi.tpPerPsgr
  const tpBase = tpByCC[bracket]
  return {
    tpPremium: tpBase + (passengerVal * tpPerPsgr[bracket]),
    odRate: odRates[vehicleAge][zone][bracket],
    details: {
      label: ccVal <= 1000 ? '≤1000 CC' : ccVal <= 1500 ? '1001–1500 CC' : '>1500 CC',
      tpBase,
      tpPsgr: passengerVal * tpPerPsgr[bracket],
    },
  }
}
