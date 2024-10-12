import {FieldType, RecordField} from './RecordField';
import {AccuracyScaling, MissileProperties, SmokeProperties, Weapon} from './unit';

export class WeaponRecord {
  constructor(weapon: Weapon) {
    this.showInInterface = new RecordField(
      'showInInterface',
      'Show in interface',
      weapon.showInInterface,
      FieldType.BOOLEAN
    );
    this.fireLeftToRight = new RecordField(
      'fireLeftToRight',
      'Fire left to right',
      weapon.fireLeftToRight,
      FieldType.BOOLEAN
    );
    this.numberOfWeapons = new RecordField(
      'numberOfWeapons',
      'Number of weapons',
      weapon.numberOfWeapons,
      FieldType.NUMBER
    );
    this.hasTurret = new RecordField(
      'hasTurret',
      'Has turret',
      weapon.hasTurret,
      FieldType.BOOLEAN
    );
    this.turretRotationSpeed = new RecordField(
      'turretRotationSpeed',
      'Turret rotation speed',
      weapon.turretRotationSpeed,
      FieldType.ANGULAR_SPEED
    );
    this.traits = new RecordField(
      'traits',
      'Traits',
      weapon.traits,
      FieldType.COMPLEX
      );
    this.ammoDescriptorName = new RecordField(
      'ammoDescriptorName',
      'Ammo descriptor name',
      weapon.ammoDescriptorName,
      FieldType.DEFAULT
    );
    this.weaponName = new RecordField(
      'weaponName',
      'Weapon name',
      weapon.weaponName,
      FieldType.DEFAULT
    );
    this.he = new RecordField(
      'he',
      'HE',
      weapon.he,
      FieldType.NUMBER
    );
    this.heDamageRadius = new RecordField(
      'heDamageRadius',
      'HE damage radius',
      weapon.heDamageRadius,
      FieldType.DISTANCE
    );
    this.suppress = new RecordField(
      'suppress',
      'Suppress',
      weapon.suppress,
      FieldType.NUMBER
    );
    this.suppressDamagesRadius = new RecordField(
      'suppressDamagesRadius',
      'Suppress damages radius',
      weapon.suppressDamagesRadius,
      FieldType.DISTANCE
    );
    this.groundRange = new RecordField(
      'groundRange',
      'Ground range',
      weapon.groundRange,
      FieldType.DISTANCE
    );
    this.groundMinRange = new RecordField(
      'groundMinRange',
      'Ground min range',
      weapon.groundMinRange,
      FieldType.DISTANCE
    );
    this.helicopterRange = new RecordField(
      'helicopterRange',
      'Helicopter range',
      weapon.helicopterRange,
      FieldType.DISTANCE
    );
    this.helicopterMinRange = new RecordField(
      'helicopterMinRange',
      'Helicopter min range',
      weapon.helicopterMinRange,
      FieldType.DISTANCE
    );
    this.planeRange = new RecordField(
      'planeRange',
      'Plane range',
      weapon.planeRange,
      FieldType.DISTANCE
    );
    this.planeMinRange = new RecordField(
      'planeMinRange',
      'Plane min range',
      weapon.planeMinRange,
      FieldType.DISTANCE
    );
    this.aimingTime = new RecordField(
      'aimingTime',
      'Aiming time',
      weapon.aimingTime,
      FieldType.TIME
    );
    this.reloadTime = new RecordField(
      'reloadTime',
      'Reload time',
      weapon.reloadTime,
      FieldType.TIME
    );
    this.salvoLength = new RecordField(
      'salvoLength',
      'Salvo length',
      weapon.salvoLength,
      FieldType.NUMBER
    );
    this.totalHeDamage = new RecordField(
      'totalHeDamage',
      'Total HE damage',
      weapon.totalHeDamage,
      FieldType.NUMBER
    );
    
    this.timeBetweenSalvos = new RecordField(
      'timeBetweenSalvos',
      'Time between shots',
      weapon.timeBetweenSalvos,
      FieldType.TIME
    );

    this.staticAccuracy = new RecordField(
      'staticAccuracy',
      'Accuracy',
      weapon.staticAccuracy,
      FieldType.PERCENTAGE
    );

     this.movingAccuracy = new RecordField(
      'movingAccuracy',
      'Moving accuracy',
      weapon.movingAccuracy,
      FieldType.PERCENTAGE
    );

    this.staticAccuracyScaling = new RecordField(
      'staticAccuracyScaling',
      'Accuracy scaling',
      weapon.staticAccuracyScaling,
      FieldType.COMPLEX
    );

    this.movingAccuracyScaling = new RecordField(
      'movingAccuracyScaling',
      'Moving accuracy scaling',
      weapon.movingAccuracyScaling,
      FieldType.COMPLEX
    );

    this.penetration = new RecordField(
      'penetration',
      'Penetration',
      weapon.penetration,
      FieldType.NUMBER
    );

    this.instaKillAtMaxRangeArmour = new RecordField(
      'instaKillAtMaxRangeArmour',
      'Insta kill at max range armour',
      weapon.instaKillAtMaxRangeArmour,
      FieldType.NUMBER
    );

    this.trueRateOfFire = new RecordField(
      'trueRateOfFire',
      'True rate of fire',
      weapon.trueRateOfFire,
      FieldType.NUMBER
    );

    this.missileProperties = new RecordField(
      'missileProperties',
      'Missile properties',
      weapon.missileProperties,
      FieldType.COMPLEX
    );

    this.smokeProperties = new RecordField(
      'smokeProperties',
      'Smoke properties',
      weapon.smokeProperties,
      FieldType.COMPLEX
    );

    this.numberOfSalvos = new RecordField(
      'numberOfSalvos',
      'Number of salvos',
      weapon.numberOfSalvos,
      FieldType.NUMBER
    );

    this.missileAcceleration = new RecordField(
      'missileAcceleration',
      'Missile acceleration',
      weapon.missileProperties?.maxMissileAcceleration,
      FieldType.PROJECTILE_ACCELERATION
    );

    this.missileSpeed = new RecordField(
      'missileSpeed',
      'Missile speed',
      weapon.missileProperties?.maxMissileSpeed,
      FieldType.PROJECTILE_SPEED
    );

    this.smokeAltitude = new RecordField(
      'smokeAltitude',
      'Smoke altitude',
      weapon.smokeProperties?.altitude,
      FieldType.DISTANCE
    );

    this.smokeLifeSpan = new RecordField(
      'smokeLifeSpan',
      'Smoke life span',
      weapon.smokeProperties?.lifeSpan,
      FieldType.TIME
    );

    this.smokeRadius = new RecordField(
      'smokeRadius',
      'Smoke radius',
      weapon.smokeProperties?.radius,
      FieldType.DISTANCE
    );

    this.dispersionAtMinRange = new RecordField(
      'dispersionAtMinRange',
      'Dispersion at min range',
      weapon.dispersionAtMinRange,
      FieldType.DISTANCE
    );

    this.dispersionAtMaxRange = new RecordField(
      'dispersionAtMaxRange',
      'Dispersion at max range',
      weapon.dispersionAtMaxRange,
      FieldType.DISTANCE
    );
    

    this.supplyCost = new RecordField('supplyCost', 'Supply cost', weapon.supplyCost, FieldType.NUMBER);
  }

  showInInterface: RecordField<boolean>;
  fireLeftToRight: RecordField<boolean>;
  numberOfWeapons: RecordField<number>;
  hasTurret: RecordField<boolean>;
  turretRotationSpeed: RecordField<number>;
  traits: RecordField<string[]>;
  ammoDescriptorName: RecordField<string>;
  weaponName: RecordField<string>;
  he: RecordField<number>;
  heDamageRadius: RecordField<number>;
  suppress: RecordField<number>;
  suppressDamagesRadius: RecordField<number>;
  groundRange: RecordField<number>;
  groundMinRange: RecordField<number>;
  helicopterRange: RecordField<number>;
  helicopterMinRange: RecordField<number>;
  planeRange: RecordField<number>;
  planeMinRange: RecordField<number>;
  aimingTime: RecordField<number>;
  reloadTime: RecordField<number>;
  salvoLength: RecordField<number>;
  totalHeDamage: RecordField<number>;
  timeBetweenSalvos: RecordField<number>;
  staticAccuracy: RecordField<number>;
  movingAccuracy: RecordField<number>;
  staticAccuracyScaling: RecordField<AccuracyScaling | undefined>;
  movingAccuracyScaling: RecordField<AccuracyScaling | undefined>;
  penetration: RecordField<number>;
  instaKillAtMaxRangeArmour: RecordField<number>;
  trueRateOfFire: RecordField<number>;
  missileProperties: RecordField<MissileProperties | undefined>;
  smokeProperties: RecordField<SmokeProperties | undefined>;
  numberOfSalvos: RecordField<number>;

  missileAcceleration: RecordField<number | undefined>;
  missileSpeed: RecordField<number | undefined>;

  smokeAltitude: RecordField<number | undefined>;
  smokeLifeSpan: RecordField<number | undefined>;
  smokeRadius: RecordField<number | undefined>;
  dispersionAtMaxRange: RecordField<number| undefined>;
  dispersionAtMinRange: RecordField<number | undefined>;

  supplyCost: RecordField<number | undefined>;

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
