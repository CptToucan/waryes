interface IconTraitMap {
    [iconIdentifier: string]: Trait
}

const iconTraitMap: IconTraitMap = {
    'trait-amphibious' : 
    { 
        name: "Amphibious", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: ['Can traverse deep waters at 37.5% of the offroad speed']
    },
    'trait-recon':
    { 
        name: "Recon", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: ['Deploys 2473m ahead at the start of the game']
    },
    'trait-leader':
    { 
        name: "Leader", range: 'Variable', 
        activationCondition: 'Own units nearby', 
        effects: [
            'Grants +1 veterancy to all allies within radius',
            'Radius is 425m/565m/636m depending on leader veterancy',
            'Veterancy bonus caps at level 3 veterancy and does not apply to other leaders'
        ]
    },
    'trait-ifv':
    { 
        name: "IFV", range: '318m', 
        activationCondition: 'Own infantry within range', 
        effects: ['-50% suppression']
    },
    'trait-resolute':
    { 
        name: "Resolute", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: ['-15% suppression']
    },
    'parachute':
    { 
        name: "Airborne", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: ['Deploys 3534m ahead at the start of the game']
    },
    'trait-reservist':
    { 
        name: "Reservist", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: [
            '+33% suppression',
            '+10% aimtime',
            '-10% static & motion accuracy',
            '+10% reload time'
        ]
    },
    'trait-cqc':
    { 
        name: "Shock", range: '141m', 
        activationCondition: 'Enemy units within range', 
        effects: [
            '-20% aim time',
            '-20% reload time',
            '-20% time between shots within a salvo',
            '+20% damage inflicted'
        ]
    },
    'trait-special-forces':
    { 
        name: "Special Forces", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: ['Gains access to improved veterancy table']
    },
    'trait-mp':
    { 
        name: "Military Police", range: '265m', 
        activationCondition: 'Own units within range', 
        effects: [
            '+1.25 suppression regeneration per second',
            'removes reservist trait'
        ]
    },
    'trait-gsr':
    { 
        name: "GSR", range: 'N/A', 
        activationCondition: 'Immobile', 
        effects: [
            '+2000 vision',
            '+43 optical strength'
        ]
    },
    'trait-security':
    { 
        name: "Security", range: 'N/A', 
        activationCondition: 'Immobile', 
        effects: ['+43 optical strength']
    },
    'trait-transport':
    { 
        name: "Transport", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: ['can transport owned infantry or towed weapons']
    },
    'trait-sniper':
    { 
        name: "Sniper", range: 'N/A', 
        activationCondition: 'Immobile for 10 seconds', 
        effects: [
            '+0.5 dissimulation',
            '+20% static accuracy',
            '+500% damage inflicted'
        ]
    },
    'trait-era':
    { 
        name: "ERA", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: [
            '+2 HP',
            'up to +2 front/side armor',
            '+1 damage taken from HEAT with tandem'
        ]
    },
    'trait-false-flag':
    { 
        name: "False-Flag", range: 'N/A', 
        activationCondition: 'N/A', 
        effects: ['dangerousness is 0, will be last unit auto-targeted']
    }
}

export function getTraitFromIconName(icon: string): Trait {
    return iconTraitMap[icon];
}