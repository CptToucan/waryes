import { Unit } from "../types/unit";

enum FieldType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Array = 'array',
  Object = 'object',
  Enum = 'enum',
}

interface NewFieldMetadata {
  name: string;
  type: FieldType;
  displayUnit?: string;
}

/*
name: new StringFieldMetadata('name', 'Name', UnitFieldType.UNIT),
    category: new StringFieldMetadata(
      'category',
      'Category',
      UnitFieldType.UNIT
    ),
    id: new StringFieldMetadata('id', 'Id', UnitFieldType.UNIT),
    commandPoints: new NumberFieldMetadata(
      'commandPoints',
      'Command Points',
      UnitFieldType.UNIT
    ),
    descriptorName: new StringFieldMetadata(
      'descriptorName',
      'Descriptor Name',
      UnitFieldType.UNIT
    ),
    frontArmor: new NumberFieldMetadata(
      'frontArmor',
      'Front Armor',
      UnitFieldType.UNIT
    ),
    sideArmor: new NumberFieldMetadata(
      'sideArmor',
      'Side Armor',
      UnitFieldType.UNIT
    ),
    rearArmor: new NumberFieldMetadata(
      'rearArmor',
      'Rear Armor',
      UnitFieldType.UNIT
    ),
    topArmor: new NumberFieldMetadata(
      'topArmor',
      'Top Armor',
      UnitFieldType.UNIT
    ),
    maxDamage: new NumberFieldMetadata(
      'maxDamage',
      'Max Damage',
      UnitFieldType.UNIT
    ),
    speed: new NumberFieldMetadata('speed', 'Speed', UnitFieldType.UNIT),
    roadSpeed: new NumberFieldMetadata(
      'roadSpeed',
      'Road Speed',
      UnitFieldType.UNIT
    ),
    optics: new NumberFieldMetadata('optics', 'Optics', UnitFieldType.UNIT),
    airOptics: new NumberFieldMetadata(
      'airOptics',
      'Air Optics',
      UnitFieldType.UNIT
    ),
    stealth: new NumberFieldMetadata('stealth', 'Stealth', UnitFieldType.UNIT),
    advancedDeployment: new NumberFieldMetadata(
      'advancedDeployment',
      'Advanced Deployment',
      UnitFieldType.UNIT
    ),
    fuel: new NumberFieldMetadata('fuel', 'Fuel', UnitFieldType.UNIT),
    fuelMove: new NumberFieldMetadata(
      'fuelMove',
      'Fuel Move',
      UnitFieldType.UNIT
    ),
    supply: new NumberFieldMetadata('supply', 'Supply', UnitFieldType.UNIT),
    ecm: new NumberFieldMetadata('ecm', 'ECM', UnitFieldType.UNIT),
    agility: new NumberFieldMetadata('agility', 'Agility', UnitFieldType.UNIT),
    travelTime: new NumberFieldMetadata(
      'travelTime',
      'Travel Time',
      UnitFieldType.UNIT
    ),
    */


const unitFields: NewFieldMetadata[] = [
  { name: 'name', type: FieldType.String, displayUnit: 'Name' },
  { name: 'category', type: FieldType.String, displayUnit: 'Category' },
  { name: 'id', type: FieldType.String, displayUnit: 'Id' },
  { name: 'commandPoints', type: FieldType.Number, displayUnit: 'Command Points' },
  { name: 'descriptorName', type: FieldType.String, displayUnit: 'Descriptor Name' },
  { name: 'frontArmor', type: FieldType.Number, displayUnit: 'Front Armor' },
  { name: 'sideArmor', type: FieldType.Number, displayUnit: 'Side Armor' },
  { name: 'rearArmor', type: FieldType.Number, displayUnit: 'Rear Armor' },
  { name: 'topArmor', type: FieldType.Number, displayUnit: 'Top Armor' },
  { name: 'maxDamage', type: FieldType.Number, displayUnit: 'Max Damage' },
  { name: 'speed', type: FieldType.Number, displayUnit: 'Speed' },
  { name: 'roadSpeed', type: FieldType.Number, displayUnit: 'Road Speed' },
  { name: 'optics', type: FieldType.Number, displayUnit: 'Optics' },
  { name: 'airOptics', type: FieldType.Number, displayUnit: 'Air Optics' },
  { name: 'stealth', type: FieldType.Number, displayUnit: 'Stealth' },
  { name: 'advancedDeployment', type: FieldType.Number, displayUnit: 'Advanced Deployment' },
  { name: 'fuel', type: FieldType.Number, displayUnit: 'Fuel' },
  { name: 'fuelMove', type: FieldType.Number, displayUnit: 'Fuel Move' },
  { name: 'supply', type: FieldType.Number, displayUnit: 'Supply' },
  { name: 'ecm', type: FieldType.Number, displayUnit: 'ECM' },
  { name: 'agility', type: FieldType.Number, displayUnit: 'Agility' },
  { name: 'travelTime', type: FieldType.Number, displayUnit: 'Travel Time' },
]

/*
weaponName: new StringFieldMetadata(
      'weaponName',
      'Name',
      UnitFieldType.WEAPON
    ),
    ammoDescriptorName: new StringFieldMetadata(
      'ammoDescriptorName',
      'Ammo Descriptor Name',
      UnitFieldType.WEAPON
    ),
    penetration: new NumberFieldMetadata(
      'penetration',
      'Penetration',
      UnitFieldType.WEAPON
    ),
    he: new NumberFieldMetadata('he', 'HE', UnitFieldType.WEAPON),
    suppress: new NumberFieldMetadata(
      'suppress',
      'Suppress',
      UnitFieldType.WEAPON
    ),
    groundRange: new NumberFieldMetadata(
      'groundRange',
      'Ground Range',
      UnitFieldType.WEAPON
    ),
    helicopterRange: new NumberFieldMetadata(
      'helicopterRange',
      'Helicopter Range',
      UnitFieldType.WEAPON
    ),
    planeRange: new NumberFieldMetadata(
      'planeRange',
      'Plane Range',
      UnitFieldType.WEAPON
    ),
    aimingTime: new NumberFieldMetadata(
      'aimingTime',
      'Aiming Time',
      UnitFieldType.WEAPON
    ),
    reloadTime: new NumberFieldMetadata(
      'reloadTime',
      'Reload Time',
      UnitFieldType.WEAPON
    ),
    salvoLength: new NumberFieldMetadata(
      'salvoLength',
      'Salvo Length',
      UnitFieldType.WEAPON
    ),
    rateOfFire: new NumberFieldMetadata(
      'rateOfFire',
      'Rate of Fire',
      UnitFieldType.WEAPON
    ),
    supplyCost: new NumberFieldMetadata(
      'supplyCost',
      'Supply Cost',
      UnitFieldType.WEAPON
    ),
    staticAccuracy: new NumberFieldMetadata(
      'staticAccuracy',
      'Static Accuracy',
      UnitFieldType.WEAPON
    ),
    movingAccuracy: new NumberFieldMetadata(
      'movingAccuracy',
      'Moving Accuracy',
      UnitFieldType.WEAPON
    ),
    */

const weaponFields: NewFieldMetadata[] = [
  { name: 'weaponName', type: FieldType.String, displayUnit: 'Name' },
  { name: 'ammoDescriptorName', type: FieldType.String, displayUnit: 'Ammo Descriptor Name' },
  { name: 'penetration', type: FieldType.Number, displayUnit: 'Penetration' },
  { name: 'he', type: FieldType.Number, displayUnit: 'HE' },
  { name: 'suppress', type: FieldType.Number, displayUnit: 'Suppress' },
  { name: 'groundRange', type: FieldType.Number, displayUnit: 'Ground Range' },
  { name: 'helicopterRange', type: FieldType.Number, displayUnit: 'Helicopter Range' },
  { name: 'planeRange', type: FieldType.Number, displayUnit: 'Plane Range' },
  { name: 'aimingTime', type: FieldType.Number, displayUnit: 'Aiming Time' },
  { name: 'reloadTime', type: FieldType.Number, displayUnit: 'Reload Time' },
  { name: 'salvoLength', type: FieldType.Number, displayUnit: 'Salvo Length' },
  { name: 'rateOfFire', type: FieldType.Number, displayUnit: 'Rate of Fire' },
  { name: 'supplyCost', type: FieldType.Number, displayUnit: 'Supply Cost' },
  { name: 'staticAccuracy', type: FieldType.Number, displayUnit: 'Static Accuracy' },
  { name: 'movingAccuracy', type: FieldType.Number, displayUnit: 'Moving Accuracy' },
];

export class UnitRecord {
  constructor(unit: Unit) {
    this._unit = unit;
  }

  private _unit: Unit;
}