import TARIFF from '../tariffData'
import { getCCBracket } from './helpers'

export function calcTaxi({
  isElectric, kwVal, ccVal,
  passengerVal,
  vehicleAge, zone,
}) {
  if (isElectric) {
    const kwBracket = kwVal <= 30 ? 0 : kwVal <= 65 ? 1 : 2
    return {
      tpPremium: TARIFF.taxi.electricTP[kwBracket] + (passengerVal * TARIFF.taxi.electricTPPerPsgr[kwBracket]),
      odRate: TARIFF.taxi.odRates[vehicleAge][zone][kwBracket],
      details: {
        label: kwVal <= 30 ? '≤30 KW' : kwVal <= 65 ? '30–65 KW' : '>65 KW',
        tpBase: TARIFF.taxi.electricTP[kwBracket],
        tpPsgr: passengerVal * TARIFF.taxi.electricTPPerPsgr[kwBracket],
      },
    }
  }

  const bracket = getCCBracket(ccVal)
  const tpBase = TARIFF.taxi.tpByCC[bracket]
  return {
    tpPremium: tpBase + (passengerVal * TARIFF.taxi.tpPerPsgr[bracket]),
    odRate: TARIFF.taxi.odRates[vehicleAge][zone][bracket],
    details: {
      label: ccVal <= 1000 ? '≤1000 CC' : ccVal <= 1500 ? '1001–1500 CC' : '>1500 CC',
      tpBase,
      tpPsgr: passengerVal * TARIFF.taxi.tpPerPsgr[bracket],
    },
  }
}
