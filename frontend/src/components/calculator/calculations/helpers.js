export const getCCBracket = (cc) => {
  if (cc <= 1000) return 0
  if (cc <= 1500) return 1
  return 2
}

export const get2WCCBracket = (cc) => {
  if (cc <= 75) return 0
  if (cc <= 150) return 1
  if (cc <= 350) return 2
  return 3
}

export const get2WODBracket = (cc) => {
  if (cc <= 150) return 0
  if (cc <= 350) return 1
  return 2
}
