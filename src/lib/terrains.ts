const TERRAIN_NAMES_MAP = {
  ForetLegere: 'Forest',
  Ruin: 'Ruin',
  Batiment: 'Building',
  None: 'None',
};

const REVERSE_TERRAIN_NAMES_MAP = {};

for (const key in TERRAIN_NAMES_MAP) {
  if (Object.prototype.hasOwnProperty.call(TERRAIN_NAMES_MAP, key)) {
    const terrainKey = key as keyof typeof TERRAIN_NAMES_MAP;
    const reverseTerrainKey = TERRAIN_NAMES_MAP[
      terrainKey
    ] as keyof typeof REVERSE_TERRAIN_NAMES_MAP;
    REVERSE_TERRAIN_NAMES_MAP[reverseTerrainKey] = terrainKey as never;
  }
}

export {
  TERRAIN_NAMES_MAP, REVERSE_TERRAIN_NAMES_MAP
}