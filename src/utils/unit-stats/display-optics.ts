const OPTICS: {[key: number]: string} = {
  42.45: 'Bad',
  63.675: 'Mediocre',
  84.9: 'Normal',
  127.35: 'Good',
  191.025: 'Very Good',
  233.475: 'Exceptional',
};

export function displayOptics(optics: number) {
  const opticsValues = Object.keys(OPTICS).map((key) => Number(key)).sort();

  for (let i = 0; i < opticsValues.length; i++) {
    if (optics < opticsValues[i]) {
      return `${OPTICS[opticsValues[i - 1]]} (${optics})`;
    }
  }

  return OPTICS[optics] || optics;
}
