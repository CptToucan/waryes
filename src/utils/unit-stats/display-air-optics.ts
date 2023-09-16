const AIR_OPTICS: {[key: number]: string} = {
  150: 'Normal',
  300: 'Good',
  450: 'Exceptional',
};

export function displayAirOptics(optics: number) {
  const opticsValues = Object.keys(AIR_OPTICS).map((key) => Number(key));

  for (let i = 0; i < opticsValues.length; i++) {
    if (optics < opticsValues[i]) {
      if(i === 0) {
        return `Mediocre (${optics})`;
      }

      return `${AIR_OPTICS[opticsValues[i - 1]]} (${optics})`;
    }
  }

  return AIR_OPTICS[optics] || optics;
}
