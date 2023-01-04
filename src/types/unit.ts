import { AbstractFieldMetadata } from "./AbstractFieldMetadata";
import { NumberFieldMetadata } from "./NumberFieldMetadata";
import { StringFieldMetadata } from "./StringFieldMetadata";

/**
 * This interface should have all of its values defined in FieldMetadata, this is the glue holding field metadata and interface types together
 */
interface Weapon {
    showInInterface:    boolean
    ammoDescriptorName: string
    weaponName: string
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

/**
 * This interface should have all of its values defined in FieldMetadata, this is the glue holding field metadata and interface types together
 */
interface Unit {
    name: string,
    category: string,
    id: string,
    commandPoints: number,
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
    agility?:               number, 
    travelTime?:            number,
    weapons:                Weapon[],

    _searchNameHelper:      string,

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


enum UnitFieldType {
  UNIT,
  WEAPON
}

class FieldMetadata {
  static fields: FieldMetadataMap = {
    name: new StringFieldMetadata("name", "Name", UnitFieldType.UNIT),
    category: new StringFieldMetadata("category", "Category", UnitFieldType.UNIT),
    id: new StringFieldMetadata("id", "Id", UnitFieldType.UNIT),
    commandPoints: new NumberFieldMetadata("commandPoints", "Command Points", UnitFieldType.UNIT),
    descriptorName: new StringFieldMetadata("descriptorName", "Descriptor Name", UnitFieldType.UNIT),
    frontArmor: new NumberFieldMetadata("frontArmor", "Front Armor", UnitFieldType.UNIT),
    sideArmor: new NumberFieldMetadata("sideArmor", "Side Armor", UnitFieldType.UNIT),
    rearArmor: new NumberFieldMetadata("rearArmor", "Rear Armor", UnitFieldType.UNIT),
    topArmor: new NumberFieldMetadata("topArmor", "Top Armor", UnitFieldType.UNIT),
    maxDamage: new NumberFieldMetadata("maxDamage", "Max Damage", UnitFieldType.UNIT),
    speed: new NumberFieldMetadata("speed", "Speed", UnitFieldType.UNIT),
    roadSpeed: new NumberFieldMetadata("roadSpeed", "Road Speed", UnitFieldType.UNIT),
    optics: new NumberFieldMetadata("optics", "Optics", UnitFieldType.UNIT),
    airOptics: new NumberFieldMetadata("airOptics", "Air Optics", UnitFieldType.UNIT),
    stealth: new NumberFieldMetadata("stealth", "Stealth", UnitFieldType.UNIT),
    advancedDeployment: new NumberFieldMetadata("advancedDeployment", "Advanced Deployment", UnitFieldType.UNIT),
    fuel: new NumberFieldMetadata("fuel", "Fuel", UnitFieldType.UNIT),
    fuelMove: new NumberFieldMetadata("fuelMove", "Fuel Move", UnitFieldType.UNIT),
    supply: new NumberFieldMetadata("supply", "Supply", UnitFieldType.UNIT),
    ecm: new NumberFieldMetadata("ecm", "ECM", UnitFieldType.UNIT),
    agility: new NumberFieldMetadata("agility", "Agility", UnitFieldType.UNIT),
    travelTime: new NumberFieldMetadata("travelTime", "Travel Time", UnitFieldType.UNIT),

    weaponName: new StringFieldMetadata("weaponName", "Name", UnitFieldType.WEAPON),
    ammoDescriptorName: new StringFieldMetadata("ammoDescriptorName", "Ammo Descriptor Name", UnitFieldType.WEAPON),
    penetration: new NumberFieldMetadata("penetration", "Penetration", UnitFieldType.WEAPON),
    he: new NumberFieldMetadata("he", "HE", UnitFieldType.WEAPON),
    suppress: new NumberFieldMetadata("suppress", "Suppress", UnitFieldType.WEAPON),
    groundRange: new NumberFieldMetadata("groundRange", "Ground Range", UnitFieldType.WEAPON),
    helicopterRange: new NumberFieldMetadata("helicopterRange", "Helicopter Range", UnitFieldType.WEAPON),
    planeRange: new NumberFieldMetadata("planeRange", "Plane Range", UnitFieldType.WEAPON),
    aimingTime: new NumberFieldMetadata("aimingTime", "Aiming Time", UnitFieldType.WEAPON),
    reloadTime: new NumberFieldMetadata("reloadTime", "Reload Time", UnitFieldType.WEAPON),
    salvoLength: new NumberFieldMetadata("salvoLength", "Salvo Length", UnitFieldType.WEAPON),
    rateOfFire: new NumberFieldMetadata("rateOfFire", "Rate of Fire", UnitFieldType.WEAPON),
    supplyCost: new NumberFieldMetadata("supplyCost", "Supply Cost", UnitFieldType.WEAPON),
    staticAccuracy: new NumberFieldMetadata("staticAccuracy", "Static Accuracy", UnitFieldType.WEAPON),
    movingAccuracy: new NumberFieldMetadata("movingAccuracy", "Moving Accuracy", UnitFieldType.WEAPON)
  }
}

type FieldMetadataMap = {
  [key: string]: AbstractFieldMetadata<unknown>
}

export {Unit, Weapon, FieldMetadata,FieldMetadataMap, UnitFieldType};
