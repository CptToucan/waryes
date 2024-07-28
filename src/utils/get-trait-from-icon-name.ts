interface IconTraitMap {
  [iconIdentifier: string]: Trait;
}

const iconTraitMap: IconTraitMap = {
  'trait-amphibious': {
    icon: 'trait-amphibious',
    name: 'Amphibious',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: ['Can traverse deep waters at 37.5% of the offroad speed'],
  },
  'trait-recon': {
    icon: 'trait-recon',
    name: 'Recon',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: ['Deploys 2473m ahead at the start of the game'],
  },
  'trait-leader': {
    icon: 'trait-leader',
    name: 'Leader',
    range: 'Variable',
    activationCondition: 'Own units nearby',
    effects: [
      'Grants +1 veterancy to all allies within radius',
      'Radius is 425m/565m/636m depending on leader veterancy',
      'Veterancy bonus caps at level 3 veterancy and does not apply to other leaders',
    ],
  },
  'trait-ifv': {
    icon: 'trait-ifv',
    name: 'IFV',
    range: '318m',
    activationCondition: 'Own infantry within range',
    effects: ['-50% suppression'],
  },
  'trait-resolute': {
    icon: 'trait-resolute',
    name: 'Resolute',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: ['-15% suppression'],
  },
  parachute: {
    icon: 'parachute',
    name: 'Airborne',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: ['Deploys 3534m ahead at the start of the game'],
  },
  'trait-reservist': {
    icon: 'trait-reservist',
    name: 'Reservist',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: [
      '+50% suppression',
      '+20% aimtime',
      '-5% static & motion accuracy',
      '+15% reload time',
    ],
  },
  'trait-cqc': {
    icon: 'trait-cqc',
    name: 'Shock',
    range: '141m',
    activationCondition: 'Enemy units within range',
    effects: [
      '-20% aim time',
      '-20% reload time',
      '-20% time between shots within a salvo',
      '+20% damage inflicted',
    ],
  },
  'trait-special-forces': {
    icon: 'trait-special-forces',
    name: 'Special Forces',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: ['Gains access to improved veterancy table'],
  },
  'trait-mp': {
    icon: 'trait-mp',
    name: 'Military Police',
    range: '265m',
    activationCondition: 'Own units within range',
    effects: [
      '+1.25 suppression regeneration per second',
      'removes reservist trait',
    ],
  },
  'trait-gsr': {
    icon: 'trait-gsr',
    name: 'GSR',
    range: 'N/A',
    activationCondition: 'Immobile',
    effects: ['+2000 vision', '+43 optical strength'],
  },
  'trait-security': {
    icon: 'trait-security',
    name: 'Security',
    range: 'N/A',
    activationCondition: 'Immobile',
    effects: ['+43 optical strength'],
  },
  'trait-transport': {
    icon: 'trait-transport',
    name: 'Transport',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: ['can transport owned infantry or towed weapons'],
  },
  'trait-sniper': {
    icon: 'trait-sniper',
    name: 'Sniper',
    range: 'N/A',
    activationCondition: 'Immobile for 10 seconds',
    effects: [
      '+0.5 dissimulation',
      '+20% static accuracy',
      '+500% damage inflicted',
    ],
  },
  'trait-era': {
    icon: 'trait-era',
    name: 'ERA',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: [
      '+2 HP',
      'up to +2 front/side armor',
      '+1 damage taken from HEAT with tandem',
    ],
  },
  'trait-false-flag': {
    icon: 'trait-false-flag',
    name: 'False-Flag',
    range: 'N/A',
    activationCondition: 'N/A',
    effects: ['dangerousness is 0, will be last unit auto-targeted'],
  },
  'trait-ew':
  {
      icon: 'trait-ew',
      name: "Electronic Warfare", range: '3533m', 
      activationCondition: 'N/A', 
      effects: ['-20% accuracy to enemy radar anti-air units'] 
  },
  'trait-jammer':
  {
      icon: 'trait-jammer',
      name: "Jammer", range: '3533m', 

      activationCondition: 'Artillery or recon with exceptional optics in range', 
      effects: [
        '-43 optical strength and removes GSR bonus if unit is recon',
        '+50% dispersion if unit is artillery'
    ]
  },
  'trait-airlift':
  {
      icon: 'trait-airlift',
      name: "Airlift", range: 'N/A', 
      activationCondition: 'N/A', 
      effects: [
        'This vehicle or gun can be transported by helicopters, as long as it gets the AIRLIFTER trait'
    ]
  },
  'trait-airlifter':
  {
      icon: 'trait-airlifter',
      name: "Airlift", range: 'N/A', 
      activationCondition: 'N/A', 
      effects: [
        'This helicopter can transport vehicles or guns with the AIRLIFT trait'
    ]
  },
};

export function getTraitFromIconName(icon: string): Trait {
  return iconTraitMap[icon];
}
