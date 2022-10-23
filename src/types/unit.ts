interface WeaponMetaData {
    showInInterface:    boolean
    ammoDescriptorName: string
    he?:                number
    suppress?:          number
    groundRange?:       number
    helicopterRange?:   number
    planeRange?:        number
    aimingTime?:        number
    reloadTime?:        number
    salvoLength?:       number
    rateOfFire?:        number
    salvoIndex:         number
    supplyCost?:        number
    staticAccuracy:     number
    movingAccuracy:     number
    penetration?:       number

    // TODO: Audit / remove
    // old vlaues missing or removed
    // aiming?:            number,
    // aircraft?:          string,
    // ammunition?:        string,
    // ground?:            number,
    // helicopter?:        number,
    // motion?:            number,
    // name?:              string,
    // reload?:            number,
    // static?:            number,
    // type?:              string,
}

interface Unit {
    descriptorName:         string,
    frontArmor:             number,
    sideArmor:              number,
    rearArmor:              number,
    topArmor:               number,
    maxDamage:              number,
    speed:                  number,
    roadSpeed:              number,
    optics?:                number,
    airOptics?:             number,
    stealth?:               number,
    advancedDeployment?:    number,
    fuel?:                  number,
    fuelMove?:              number,
    supply?:                number,
    ecm:                    number,
    agility?:               string, 
    travelTime?:            number,
    weapons:                WeaponMetaData[]
    
    // TODO: Audit / remove
    // old values missing or removed
    // _name:              string,
    // autonomy?:          number,
    // commandPoints:      number,
    // id:                 string,
    // revealInfluence:    boolean,
    // strength?:          number,
    // trajectory?:        number,
    // transport?:         string,
    // version:            string,
    // weaponMetadata:     WeaponMetaData[],
}

export {Unit, WeaponMetaData};
