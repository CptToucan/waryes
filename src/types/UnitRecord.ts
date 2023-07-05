import { FieldType, RecordField } from './RecordField';
import {InfoPanelType, SpeedForTerrain, Unit, UnitType } from './unit';
import { WeaponRecord } from './WeaponRecord';

export class UnitRecord {
  constructor(unit: Unit) {
    this.unit = unit;
    this.descriptorName = new RecordField("descriptorName", "Descriptor Name", unit.descriptorName, FieldType.DEFAULT);
    this.name = new RecordField("name", "Name", unit.name, FieldType.DEFAULT);
    this.category = new RecordField("category", "Category", unit.category, FieldType.DEFAULT);
    this.id = new RecordField("id", "Id", unit.id, FieldType.DEFAULT);
    this.unitType = new RecordField("unitType", "Unit Type", unit.unitType, FieldType.COMPLEX);
    this.commandPoints = new RecordField("commandPoints", "Command Points", unit.commandPoints, FieldType.NUMBER);
    this.factoryDescriptor = new RecordField("factoryDescriptor", "Factory Descriptor", unit.factoryDescriptor, FieldType.DEFAULT);
    this.frontArmor = new RecordField("frontArmor", "Front Armor", unit.frontArmor, FieldType.NUMBER);
    this.sideArmor = new RecordField("sideArmor", "Side Armor", unit.sideArmor, FieldType.NUMBER);
    this.rearArmor = new RecordField("rearArmor", "Rear Armor", unit.rearArmor, FieldType.NUMBER);
    this.topArmor = new RecordField("topArmor", "Top Armor", unit.topArmor, FieldType.NUMBER);
    this.maxDamage = new RecordField("maxDamage", "Max Damage", unit.maxDamage, FieldType.NUMBER);
    this.speed = new RecordField("speed", "Speed", unit.speed, FieldType.SPEED);
    this.speedsForTerrains = new RecordField("speedsForTerrains", "Speeds For Terrains", unit.speedsForTerrains, FieldType.COMPLEX);
    this.roadSpeed = new RecordField("roadSpeed", "Road Speed", unit.roadSpeed, FieldType.SPEED);
    this.rotationTime = new RecordField("rotationTime", "Rotation Time", unit.rotationTime, FieldType.TIME);
    this.optics = new RecordField("optics", "Optics", unit.optics, FieldType.NUMBER);
    this.airOptics = new RecordField("airOptics", "Air Optics", unit.airOptics, FieldType.NUMBER);
    this.stealth = new RecordField("stealth", "Stealth", unit.stealth, FieldType.NUMBER);
    this.infoPanelType = new RecordField("infoPanelType", "Info Panel Type", unit.infoPanelType, FieldType.COMPLEX);
    this.advancedDeployment = new RecordField("advancedDeployment", "Advanced Deployment", unit.advancedDeployment, FieldType.DISTANCE);
    this.fuel = new RecordField("fuel", "Fuel", unit.fuel, FieldType.LIQUID);
    this.fuelMove = new RecordField("fuelMove", "Fuel Move", unit.fuelMove, FieldType.TIME);
    this.supply = new RecordField("supply", "Supply", unit.supply, FieldType.LIQUID);
    this.ecm = new RecordField("ecm", "Ecm", unit.ecm, FieldType.DECIMAL_PERCENTAGE);
    this.agility = new RecordField("agility", "Agility", unit.agility, FieldType.DISTANCE);
    this.travelTime = new RecordField("travelTime", "Travel Time", unit.travelTime, FieldType.TIME);
    this.hasDefensiveSmoke = new RecordField("hasDefensiveSmoke", "Has Defensive Smoke", unit.hasDefensiveSmoke, FieldType.BOOLEAN);
    this.specialities = new RecordField("specialities", "Specialities", unit.specialities, FieldType.COMPLEX);
    this.bombStrategy = new RecordField("bombStrategy", "Bomb Strategy", unit.bombStrategy, FieldType.DEFAULT);
    this.isSellable = new RecordField("isSellable", "Is Sellable", unit.isSellable, FieldType.BOOLEAN);
    this.divisions = new RecordField("divisions", "Divisions", unit.divisions, FieldType.COMPLEX);

    const weaponRecords = [];
    for(const weapon of unit.weapons) {
      const weaponRecord = new WeaponRecord(weapon);
      weaponRecords.push(weaponRecord);
    }
    this.weaponRecords = weaponRecords;
  }
  readonly unit: Unit;
  readonly weaponRecords: WeaponRecord[];

  readonly descriptorName: RecordField<string>;
  readonly name: RecordField<string>;
  readonly category: RecordField<string>;
  readonly id: RecordField<number>;
  readonly unitType: RecordField<UnitType>;
  readonly commandPoints: RecordField<number>;
  readonly factoryDescriptor: RecordField<string>;
  readonly frontArmor: RecordField<number>;
  readonly sideArmor: RecordField<number>;
  readonly rearArmor: RecordField<number>;
  readonly topArmor: RecordField<number>;
  readonly maxDamage: RecordField<number>;
  readonly speed: RecordField<number>;
  readonly speedsForTerrains: RecordField<SpeedForTerrain[]>;
  readonly roadSpeed: RecordField<number>;
  readonly rotationTime: RecordField<number>;
  readonly optics: RecordField<number>;
  readonly airOptics: RecordField<number>;
  readonly stealth: RecordField<number>;
  readonly infoPanelType: RecordField<InfoPanelType>;
  readonly advancedDeployment: RecordField<number>;
  readonly fuel: RecordField<number | null>;
  readonly fuelMove: RecordField<number | null>;
  readonly supply: RecordField<number | null>;
  readonly ecm: RecordField<number>;
  readonly agility: RecordField<number | undefined>;
  readonly travelTime: RecordField<number | null>;
  readonly hasDefensiveSmoke: RecordField<boolean>;
  readonly specialities: RecordField<string[]>;
  readonly bombStrategy: RecordField<string>;
  readonly isSellable: RecordField<boolean>;
  readonly divisions: RecordField<string[]>;

  getFields(): RecordField<unknown>[] {
    const fields: string[] = Object.getOwnPropertyNames(this);
    const recordFields: RecordField<unknown>[] = [];
  
    for (const field of fields) {
      const fieldValue = this[field as keyof this];
      if (fieldValue instanceof RecordField && fieldValue.fieldType !== FieldType.COMPLEX) {
        recordFields.push(fieldValue);
      }
    }
  
    return recordFields;
  }
}
