import TARIFF from '../tariffData'
import { getCCBracket } from './helpers'

export function calcTaxi({
  isElectric, kwVal, ccVal,
  passengerVal,
  vehicleAge, zone,
}) {
  if (isElectric) {
    const kwBracket = kwVal < 30 ? 0 : kwVal <= 65 ? 1 : 2
    return {
      tpPremium: TARIFF.taxi.electricTP[kwBracket] + (passengerVal * TARIFF.taxi.electricTPPerPsgr[kwBracket]),
      odRate: TARIFF.taxi.odRates[vehicleAge][zone][kwBracket],
      details: { label: `${kwVal} KW (Electric)` },
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
