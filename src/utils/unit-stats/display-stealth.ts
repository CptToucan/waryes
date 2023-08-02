const STEALTH: {[key: number]: string} = {
    1: "Bad",
    1.5: "Mediocre",
    2: "Good",
    2.5: "Exceptional"
}

export function displayStealth(stealth: number ) {
  return STEALTH[stealth] || stealth;

}