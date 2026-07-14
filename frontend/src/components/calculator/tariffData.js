const TARIFF = {
  private_car: {
    tpByCC: [2094, 3416, 7897],
    tp3YrsByCC: [6521, 10640, 24596],
    odRates: {
      upto_5: { A: [3.127, 3.283, 3.440], B: [3.039, 3.191, 3.343] },
      '5_to_7': { A: [3.283, 3.447, 3.612], B: [3.191, 3.351, 3.510] },
      above_7: { A: [3.362, 3.529, 3.698], B: [3.267, 3.430, 3.596] },
    },
    electricTP1yr: [1780, 2904, 6712],
    electricTP3yr: [5543, 9044, 20907],
  },
  two_wheeler: {
    tpByCC: [538, 714, 1366, 2804],
    tpLongTerm: [6521, 10640, 24596, null],
    tpBundle5yr: [2901, 3851, 7365, 15117],
    odRates: {
      upto_5: { A: [1.708, 1.793, 1.879], B: [1.676, 1.760, 1.844] },
      '5_to_7': { A: [1.793, 1.883, 1.973], B: [1.760, 1.848, 1.936] },
      above_7: { A: [1.836, 1.928, 2.020], B: [1.802, 1.892, 1.982] },
    },
    electricTP1yr: [457, 607, 1161, 2383],
    electricTP5yr: [2466, 3273, 6260, 12849],
  },
  gcv: {
    tpByGVW: [16049, 27186, 35313, 43950, 44242],
    electricTpByGVW: [13642, 23108, 30016, 37357, 37606],
    extraPer100kg: 27,
    odRates: {
      upto_5: { A: 1.751, B: 1.743, C: 1.726 },
      '5_to_7': { A: 1.795, B: 1.787, C: 1.770 },
      above_7: { A: 1.839, B: 1.830, C: 1.812 },
    },
  },
  gcv_3w: {
    subtypes: [
      { id: 'public', label: '3W GCV', tp: 4492 },
      { id: 'erickshaw_gcv', label: '3W e-Rickshaw GCV', tp: 3139 },
    ],
    odRates: {
      upto_5: { A: 1.664, B: 1.656, C: 1.640 },
      '5_to_7': { A: 1.706, B: 1.697, C: 1.681 },
      above_7: { A: 1.747, B: 1.739, C: 1.722 },
    },
  },
  taxi: {
    tpByCC: [6040, 7940, 10523],
    tpPerPsgr: [1162, 978, 1117],
    odRates: {
      upto_5: { A: [3.284, 3.448, 3.612], B: [3.191, 3.351, 3.510] },
      '5_to_7': { A: [3.366, 3.534, 3.703], B: [3.271, 3.435, 3.598] },
      above_7: { A: [3.448, 3.620, 3.793], B: [3.351, 3.519, 3.686] },
    },
    electricTP: [5134, 6749, 8945],
    electricTPPerPsgr: [988, 831, 949],
  },
  pcv: {
    subtypes: [
      { id: 'school_bus', label: 'School Bus', tpBase: 12192, tpPerPsgr: 745, isElectric: false },
      { id: 'other_bus', label: 'Other Bus / Maxi', tpBase: 14343, tpPerPsgr: 877, isElectric: false },
      { id: 'e_school_bus', label: 'E-School Bus', tpBase: 10363, tpPerPsgr: 633, isElectric: true },
      { id: 'e_other_bus', label: 'E-Bus / Maxi', tpBase: 12192, tpPerPsgr: 745, isElectric: true },
    ],
    odRates: {
      upto_5: { A: 1.680, B: 1.672, C: 1.656 },
      '5_to_7': { A: 1.722, B: 1.714, C: 1.697 },
      above_7: { A: 1.764, B: 1.756, C: 1.739 },
    },
    addOD: [
      { maxPsgr: 18, extra: 350 },
      { maxPsgr: 36, extra: 450 },
      { maxPsgr: 60, extra: 550 },
      { maxPsgr: Infinity, extra: 680 },
    ],
  },
  pcv_3w: {
    subtypes: [
      { id: 'c1b', label: '3W PCV ≤6 Psgr (C1 B)', tpBase: 2539, tpPerPsgr: 1214 },
      { id: 'erickshaw_c1b', label: '3W e-Rick PCV ≤6 Psgr', tpBase: 1648, tpPerPsgr: 789 },
      { id: 'c3a', label: '3WH PCV >6 & <17 Psgr (C3 A)', tpBase: 6763, tpPerPsgr: 1349 },
      { id: 'erickshaw_c3a', label: '3W e-Rick PCV >6 Psgr', tpBase: 5749, tpPerPsgr: 1147 },
    ],
    odRates: {
      upto_5: { A: 1.680, B: 1.672, C: 1.656 },
      '5_to_7': { A: 1.722, B: 1.714, C: 1.697 },
      above_7: { A: 1.764, B: 1.756, C: 1.739 },
    },
  },
  misc_d: {
    subtypes: [
      { id: 'other', label: 'Other Vehicle', tp: 7267 },
      { id: 'agri_tractor', label: 'Agriculture Tractors upto 6 HP', tp: 1645 },
    ],
    odRates: {
      upto_5: { C: 1.190, B: 1.202, A: 1.208 },
      '5_to_7': { C: 1.220, B: 1.232, A: 1.238 },
      above_7: { C: 1.250, B: 1.262, A: 1.268 },
    },
  },
}

export default TARIFF
