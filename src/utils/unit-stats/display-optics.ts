const OPTICS: {[key: number]: string} = {
  42.45: "Bad",
  63.675: "Medicore",
  84.9: "Normal",
  127.35: "Good",
  191.025: "Very Good",
  233.475: "Exceptional"
}

export function displayOptics(optics: number ) {
return OPTICS[optics] || optics;

}