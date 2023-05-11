import { AbstractFieldMetadata } from "./AbstractFieldMetadata";
import { Country } from "./deck-builder";
import { NumberFieldMetadata } from "./NumberFieldMetadata";
import { StringFieldMetadata } from "./StringFieldMetadata";


interface AccuracyScalingItem {
  distance: number
  accuracy: number
}

interface AccuracyScaling {
  ground?: AccuracyScalingItem[]
  helicopter?: AccuracyScalingItem[]
  plane?: AccuracyScalingItem[]
}

interface MissileProperties {
  maxMissileAcceleration: number
  maxMissileSpeed: number
}

interface SmokeProperties {
  altitude: number
  lifeSpan: number
  radius: number
}

enum InfoPanelType {
  DEFAULT = "default",
  SUPPLY_VEHICLE = "supply-vehicle",
  TRANSPORT_VEHICLE = "transport-vehicle",
  INFANTRY = "infantry",
  PLANE = "plane",
  HELICOPTER = "helicopter",
  TRANSPORT_HELICOPTER = "transport-helicopter",
  SUPPLY_HELICOPTER = "supply-helicopter"
}

/**
 * This interface should have all of its values defined in FieldMetadata, this is the glue holding field metadata and interface types together
 */
interface Weapon {
    showInInterface:    boolean
    fireLeftToRight: boolean
    numberOfWeapons: number
    hasTurret: boolean
    turretRotationSpeed: number
    traits: string[]
    ammoDescriptorName: string
    weaponName: string
    he:                number
    heDamageRadius: number
    suppress:          number
    suppressDamagesRadius: number
    groundRange:       number
    groundMinRange:    number
    helicopterRange:   number
    helicopterMinRange: number
    planeRange:        number
    planeMinRange:     number
    aimingTime:        number
    reloadTime:        number
    salvoLength:       number
    totalHeDamage:      number
    // this is actually time between shots
    timeBetweenSalvos:  number
    ammunitionPerSalvo: number
    rateOfFire?:        number
    salvoIndex:         number
    supplyCost?:        number
    staticAccuracy:     number
    movingAccuracy:     number
    staticAccuracyScaling?: AccuracyScaling
    movingAccuracyScaling?: AccuracyScaling
    penetration:       number
    instaKillAtMaxRangeArmour: number
    trueRateOfFire: number
    missileProperties?: MissileProperties
    smokeProperties?: SmokeProperties
    numberOfSalvos: number
}

interface UnitType {
  nationality: Alliance
  motherCountry: Country
  formation: string
}

enum Alliance {
  NATO = "ENationalite/Allied",
  PACT = "ENationalite/Axis"
}

interface SpeedForTerrain {
  speed: number
  name: string
}

/**
 * This interface should have all of its values defined in FieldMetadata, this is the glue holding field metadata and interface types together
 */
interface Unit {
    descriptorName:         string
    name:                   string
    category:               string
    id:                     number
    unitType:               UnitType
    commandPoints:          number
    factoryDescriptor:      string
    frontArmor:             number
    sideArmor:              number
    rearArmor:              number
    topArmor:               number
    maxDamage:              number
    speed:                  number
    speedsForTerrains:       SpeedForTerrain[]
    roadSpeed:              number
    rotationTime:           number
    optics:                number
    airOptics:             number
    stealth:               number
    infoPanelType:         InfoPanelType
    advancedDeployment:    number
    fuel:                  number | null
    fuelMove:              number | null
    supply:                number | null
    ecm:                    number
    agility?:               number
    travelTime:            number | null
    hasDefensiveSmoke:      boolean
    specialities:           string[],
    bombStrategy:           string,
    weapons:                Weapon[]
    _searchNameHelper:      string
    isSellable:             boolean
    _display:               boolean
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

type UnitMap = {
  [key: string]: Unit
}


export {Unit, Weapon, FieldMetadata,FieldMetadataMap, UnitFieldType, UnitMap, AccuracyScaling, AccuracyScalingItem, InfoPanelType, MissileProperties, SmokeProperties, Alliance, SpeedForTerrain, UnitType};
