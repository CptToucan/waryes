export type VeterancyModifier = {
  staticAccuracy?: [string, number];
  motionAccuracy?: [string, number];
  aimTime?: number;
  reloadTime?: number;
  suppressionReceived?: number;
  veterancy: Veterancy;
  suppressRegen?: [string, number];
  dodgeBonus?: [string, number];
};

export type CohesionModifier = {
  accuracy: number;
  reloadTime?: number;
  aimTime?: number;
  cohesion: Cohesion;
};

export enum Veterancy {
  VET_0 = 'Vet 0',
  VET_1 = 'Vet 1',
  VET_2 = 'Vet 2',
  VET_3 = 'Vet 3',
  ARTY_VET_0 = 'Arty Vet 0',
  ARTY_VET_1 = 'Arty Vet 1',
  ARTY_VET_2 = 'Arty Vet 2',
  ARTY_VET_3 = 'Arty Vet 3',
  PLANE_VET_0 = 'Plane Vet 0',
  PLANE_VET_1 = 'Plane Vet 1',
  PLANE_VET_2 = 'Plane Vet 2',
  PLANE_VET_3 = 'Plane Vet 3',
  SF_VET_1 = 'SF Vet 1',
  SF_VET_2 = 'SF Vet 2',
  SF_VET_3 = 'SF Vet 3',
}

export enum Cohesion {
  HIGH = 'High',
  NORMAL = 'Normal',
  MEDIOCRE = 'Mediocre',
  LOW = 'Low',
  PLANE_HIGH = 'High (Plane)',
  PLANE_NORMAL = 'Normal (Plane)',
  PLANE_MEDIOCRE = 'Mediocre (Plane)',
  PLANE_LOW = 'Low (Plane)',
}


export const VETERANCY_MODIFIERS_MAP: {[key in Veterancy]: VeterancyModifier} = {
  [Veterancy.VET_0]: {
    suppressRegen: ["+", 0.6],
    veterancy: Veterancy.VET_0,
  },
  [Veterancy.ARTY_VET_0]: {
    suppressRegen: ["+", 0.6],
    veterancy: Veterancy.ARTY_VET_0,
  },
  [Veterancy.PLANE_VET_0]: {
    veterancy: Veterancy.PLANE_VET_0,
  },
  [Veterancy.VET_1]: {
    suppressionReceived: 0.86,
    aimTime: 0.96,
    motionAccuracy: ["+", 0.05],
    staticAccuracy: ["+", 0.05],
    reloadTime: 0.9,
    suppressRegen: ["+", 1.4],
    veterancy: Veterancy.VET_1,
  },
  [Veterancy.SF_VET_1]: {
    suppressionReceived: 0.8,
    aimTime: 0.9,
    motionAccuracy: ["+", 0.08],
    staticAccuracy: ["+", 0.08],
    reloadTime: 0.9,
    suppressRegen: ["+", 1.6],
    veterancy: Veterancy.SF_VET_1,
  },
  [Veterancy.ARTY_VET_1]: {
    suppressionReceived: 0.94,
    aimTime: 0.85,
    motionAccuracy: ["+", 0.06],
    staticAccuracy: ["+", 0.06],
    reloadTime: 0.8,
    suppressRegen: ["+", 1.4],
    veterancy: Veterancy.ARTY_VET_1,
  },
  [Veterancy.PLANE_VET_1]: {
    aimTime: 0.92,
    reloadTime: 0.9,
    suppressRegen: ["+", 1],
    veterancy: Veterancy.PLANE_VET_1,
  },
  [Veterancy.VET_2]: {
    suppressionReceived: 0.78,
    aimTime: 0.92,
    motionAccuracy: ["+", 0.1],
    staticAccuracy: ["+", 0.1],
    reloadTime: 0.85,
    suppressRegen: ["+", 1.8],
    veterancy: Veterancy.VET_2,
  },
  [Veterancy.SF_VET_2]: {
    suppressionReceived: 0.7,
    aimTime: 0.8,
    motionAccuracy: ["+", 0.12],
    staticAccuracy: ["+", 0.12],
    reloadTime: 0.8,
    suppressRegen: ["+", 2.2],
    veterancy: Veterancy.SF_VET_2,
  },
  [Veterancy.ARTY_VET_2]: {
    suppressionReceived: 0.88,
    aimTime: 0.7,
    motionAccuracy: ["+", 0.12],
    staticAccuracy: ["+", 0.12],
    reloadTime: 0.6,
    suppressRegen: ["+", 1.8],
    veterancy: Veterancy.ARTY_VET_2,
  },
  [Veterancy.PLANE_VET_2]: {
    suppressionReceived: 0.8,
    dodgeBonus: ["+", 0.05],
    aimTime: 0.88,
    motionAccuracy: ["+", 0.08],
    reloadTime: 0.8,
    suppressRegen: ["+", 2],
    veterancy: Veterancy.PLANE_VET_2,

  },
  [Veterancy.VET_3]: {
    suppressionReceived: 0.68,
    aimTime: 0.8,
    motionAccuracy: ["+", 0.15],
    staticAccuracy: ["+", 0.15],
    reloadTime: 0.8,
    suppressRegen: ["+", 2.6],
    veterancy: Veterancy.VET_3,
  },
  [Veterancy.SF_VET_3]: {
    suppressionReceived: 0.6,
    aimTime: 0.7,
    motionAccuracy: ["+", 0.16],
    staticAccuracy: ["+", 0.16],
    reloadTime: 0.7,
    suppressRegen: ["+", 2.6],
    veterancy: Veterancy.SF_VET_3,
  },
  [Veterancy.ARTY_VET_3]: {
    suppressionReceived: 0.76,
    aimTime: 0.55,
    motionAccuracy: ["+", 0.16],
    staticAccuracy: ["+", 0.16],
    reloadTime: 0.4,
    suppressRegen: ["+", 2.2],
    veterancy: Veterancy.ARTY_VET_3,
  },
  [Veterancy.PLANE_VET_3]: {
    suppressionReceived: 0.6,
    dodgeBonus: ["+", 0.1],
    aimTime: 0.68,
    motionAccuracy: ["+", 0.16],
    reloadTime: 0.6,
    suppressRegen: ["+", 3],
    veterancy: Veterancy.PLANE_VET_3,
  },
};

export const COHESION_MODIFIERS_MAP: {[key in Cohesion]: CohesionModifier} = {
  [Cohesion.HIGH]: {
    accuracy: 1,
    reloadTime: 1,
    aimTime: 1,
    cohesion: Cohesion.HIGH,
  },
  [Cohesion.NORMAL]: {
    accuracy: 0.75,
    reloadTime: 1.1,
    aimTime: 1.08,
    cohesion: Cohesion.NORMAL,
  },
  [Cohesion.MEDIOCRE]: {
    accuracy: 0.55,
    reloadTime: 1.2,
    aimTime: 1.12,
    cohesion: Cohesion.MEDIOCRE,
  },
  [Cohesion.LOW]: {
    accuracy: 0.3,
    reloadTime: 1.4,
    aimTime: 1.18,
    cohesion: Cohesion.LOW,
  },
  [Cohesion.PLANE_HIGH]: {
    accuracy: 1,
    reloadTime: 1,
    aimTime: 1,
    cohesion: Cohesion.PLANE_HIGH,
  },
  [Cohesion.PLANE_NORMAL]: {
    accuracy: 0.75,
    cohesion: Cohesion.PLANE_NORMAL,
  },
  [Cohesion.PLANE_MEDIOCRE]: {
    accuracy: 0.55,
    cohesion: Cohesion.PLANE_MEDIOCRE,
  },
  [Cohesion.PLANE_LOW]: {
    accuracy: 0.3,
    cohesion: Cohesion.PLANE_LOW,
  },
};

export const VETERANCIES: Veterancy[] = [
  Veterancy.VET_0,
  Veterancy.VET_1,
  Veterancy.VET_2,
  Veterancy.VET_3,
];

export const SF_VETERANCIES: Veterancy[] = [
  Veterancy.SF_VET_1,
  Veterancy.SF_VET_2,
  Veterancy.SF_VET_3,
];

export const ARTY_VETERANCIES: Veterancy[] = [
  Veterancy.ARTY_VET_0,
  Veterancy.ARTY_VET_1,
  Veterancy.ARTY_VET_2,
  Veterancy.ARTY_VET_3,
];

export const PLANE_VETERANCIES: Veterancy[] = [
  Veterancy.PLANE_VET_0,
  Veterancy.PLANE_VET_1,
  Veterancy.PLANE_VET_2,
  Veterancy.PLANE_VET_3,
];

export const COHESIONS: Cohesion[] = [
  Cohesion.HIGH,
  Cohesion.NORMAL,
  Cohesion.MEDIOCRE,
  Cohesion.LOW,
];

export const PLANE_COHESIONS: Cohesion[] = [
  Cohesion.PLANE_HIGH,
  Cohesion.PLANE_NORMAL,
  Cohesion.PLANE_MEDIOCRE,
  Cohesion.PLANE_LOW,
];