const STEALTH: {[key: number]: string} = {
    1: "Bad",
    1.5: "Mediocre",
    2: "Good",
    2.5: "Exceptional"
}

export function displayStealth(stealth: number ) {
  // if below between thresholds return the lower threshold

  const stealthValues = Object.keys(STEALTH).map((key) => Number(key)).sort();
  if(stealth > stealthValues[stealthValues.length - 1]) {
    return `${STEALTH[stealthValues[stealthValues.length - 1]]} (${stealth})`;
  }

  for (let i = 0; i < stealthValues.length; i++) {
    if (stealth < stealthValues[i]) {
      if(i === 0) {
        return `Bad (${stealth})`;
      }

      return `${STEALTH[stealthValues[i - 1]]} (${stealth})`;
    }
  }

  return STEALTH[stealth] || stealth;

}