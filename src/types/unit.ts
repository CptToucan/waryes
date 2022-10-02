interface WeaponMetaData {
    aiming?:             number,
    aircraft?:          string,
    ammunition?:        string,
    ground?:            number,
    he?:                number,
    helicopter?:        number,
    motion?:            number,
    name?:              string,
    penetration?:       number,
    rateOfFire?:        number,
    reload?:            number,
    salvoLength?:       number,
    static?:            number,
    supplyCost?:        number,
    suppress?:          number,
    type?:              string,
}

interface Unit {
    _name:              string,
    agility?:           string, 
    airOptics?:         string,
    autonomy?:          number,
    commandPoints:      number,
    ecm?:               number,
    frontArmor?:        number,
    fuel?:              number,
    id:                 string,
    maxDmg:             number,
    optics?:            string,
    rearArmor?:         number,
    revealInfluence:    boolean,
    roadSpeed?:         number,
    sideArmor?:         number,
    speed?:             number,
    stealth?:           string,
    strength?:          number,
    supply?:            number,
    topArmor?:          number,
    trajectory?:        number,
    transport?:         string,
    version:            string,
    weaponMetadata:     WeaponMetaData[],
}

export {Unit, WeaponMetaData};
