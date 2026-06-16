import { calcPrivateCar } from './privateCar'
import { calcTwoWheeler } from './twoWheeler'
import { calcGcv } from './gcv'
import { calcGcv3w } from './gcv3w'
import { calcTaxi } from './taxi'
import { calcPcv } from './pcv'
import { calcPcv3w } from './pcv3w'
import { calcMiscD } from './miscD'

export default {
  private_car: calcPrivateCar,
  two_wheeler: calcTwoWheeler,
  gcv: calcGcv,
  gcv_3w: calcGcv3w,
  taxi: calcTaxi,
  pcv: calcPcv,
  pcv_3w: calcPcv3w,
  misc_d: calcMiscD,
}
