import {Motion} from '../../lib/motion';
import { Side } from '../../lib/side';
import { TERRAIN_NAMES_MAP } from '../../lib/terrains';
import {
  ARTY_VETERANCIES,
  Cohesion,
  COHESION_MODIFIERS_MAP,
  COHESIONS,
  PLANE_COHESIONS,
  PLANE_VETERANCIES,
  SF_VETERANCIES,
  VETERANCIES,
  Veterancy,
  VETERANCY_MODIFIERS_MAP,
} from '../../lib/veterancies-and-cohesions';
import {DamageTable} from '../../services/bundle-manager';
import {MovementType, Unit, Weapon} from '../../types/unit';
import extractDamageFamilyProperties from '../../utils/extract-damage-family-properties';
import {DamageTableProcessor} from './DamageTableProcessor';


const ARMOUR_PIERCING_DAMAGE_FAMILIES = ['ap', 'ap_missile'];
const AFFECTED_BY_ECM = ['missile_he'];

const EXTRA_SUPPRESSION_DAMAGE_PER_DAMAGE = 0;
const MAX_SUPPRESSION = 500;

export class DamageCalculator {
  constructor(source: {unit: Unit; weapon: Weapon}, target: Unit, damageTable: DamageTable) {
    this.source = source;
    this.target = target;
    this.damageTable = damageTable;
  }

  source: {
    unit: Unit;
    weapon: Weapon;
  };

  target: Unit;
  damageTable: DamageTable;

  calculate(
    distance: number,
    side: Side,
    terrain: string,
    sourceVeterancy?: Veterancy,
    targetVeterancy?: Veterancy,
    movementType = Motion.STATIC,
    cohesion?: Cohesion
  ) {
    const damageProperties = this.getDamagePropertiesForWeaponAgainstTarget(
      this.source.weapon,
      this.target,
      distance,
      side,
      terrain,
      targetVeterancy
    );

    // get missile speed and acceleration

    const isMoving = movementType === Motion.MOVING;

    const baseAccuracy = this.getAccuracy(distance, isMoving, this.target.movementType);
    const accuracy = this.applyAccuracyModifiers(
      baseAccuracy,
      isMoving,
      damageProperties.physical.family,
      this.target,
      sourceVeterancy,
      targetVeterancy,
      cohesion
    );

    const baseAimTime = this.source.weapon?.aimingTime || 0;
    const aimTime = this.applyAimTimeModifiers(baseAimTime, sourceVeterancy, cohesion);

    const baseReloadTime = this.source.weapon?.reloadTime || 0;
    const reloadTime = this.applyReloadTimeModifiers(baseReloadTime, sourceVeterancy, cohesion);

    const salvoLength = this.source.weapon?.salvoLength || 0;
    // timeBetweenSalvos is a misnomer here, it's actually the time between shots
    const timeBetweenShots = this.source.weapon?.timeBetweenSalvos || 0;

    const healthOfUnit = this.target.maxDamage || 0;
    const damagePerShot = damageProperties.physical.damage;
    const shotsToKill = Math.ceil(healthOfUnit / damagePerShot);
    const accuracyAsDecimal = accuracy / 100;
    const averageDamagePerShot = damagePerShot * accuracyAsDecimal;
    const shotsToKillWithAccuracy = Math.ceil(healthOfUnit / averageDamagePerShot);

    const missileSpeed = this.source.weapon?.missileProperties?.maxMissileSpeed;
    const missileAcceleration = this.source.weapon?.missileProperties?.maxMissileAcceleration;

    let missileTravelTimeToTarget;
    let missileOptions;

    if (missileSpeed && missileAcceleration) {
      missileTravelTimeToTarget = this.calculateTimeTravelledByMissileToTarget(
        distance,
        missileSpeed,
        missileAcceleration
      );

      missileOptions = {
        fireAndForget: this.source.weapon?.traits?.includes('F&F') || false,
        missileTravelTimeToTarget,
      };
    }

    const timeToKill = this.calculateTimeToKill(
      shotsToKill,
      aimTime,
      reloadTime,
      timeBetweenShots,
      salvoLength,
      damageProperties.simulatenousProjectiles,
      missileOptions
    );

    const damagePerSecond = (shotsToKill * damagePerShot) / timeToKill;

    const averageTimeToKill = this.calculateTimeToKill(
      shotsToKillWithAccuracy,
      aimTime,
      reloadTime,
      timeBetweenShots,
      salvoLength,
      damageProperties.simulatenousProjectiles,
      missileOptions
    );

    const maxSuppression = MAX_SUPPRESSION;
    const suppressPerShot = damageProperties.suppression.damage;
    const shotsToMaxSuppression = Math.ceil(maxSuppression / suppressPerShot);
    const averageSuppressPerShot = suppressPerShot * accuracyAsDecimal;
    const shotsToMaxSuppressionWithAccuracy = Math.ceil(maxSuppression / averageSuppressPerShot);

    const suppressionTimeToKill = this.calculateTimeToKill(
      shotsToMaxSuppression,
      aimTime,
      reloadTime,
      timeBetweenShots,
      salvoLength,
      damageProperties.simulatenousProjectiles,
      missileOptions
    );

    const averageSuppressionTimeToKill = this.calculateTimeToKill(
      shotsToMaxSuppressionWithAccuracy,
      aimTime,
      reloadTime,
      timeBetweenShots,
      salvoLength,
      damageProperties.simulatenousProjectiles,
      missileOptions
    );

    return {
      damagePerShot: damageProperties.physical.damage,
      damagePerSecond: damagePerSecond,
      damageMultiplier: damageProperties.physical.multiplier,
      suppressionDamagePerShot: damageProperties.suppression.damage,
      suppressionMultiplier: damageProperties.suppression.multiplier,
      missileTravelTimeToTarget: missileTravelTimeToTarget,
      timeToKill: timeToKill,
      shotsToKill: shotsToKill,
      averageTimeToKill: averageTimeToKill,
      shotsToKillWithAccuracy: shotsToKillWithAccuracy,
      timeToSuppress: suppressionTimeToKill,
      shotsToSuppress: shotsToMaxSuppression,
      averageTimeToSuppress: averageSuppressionTimeToKill,
      shotsToSuppressWithAccuracy: shotsToMaxSuppressionWithAccuracy,
      accuracy: accuracy,
    };
  }

  private calculateTimeToKill(
    shotsToKill: number,
    aimingTime: number,
    reloadTime: number,
    timeBetweenShots: number,
    salvoLength: number,
    numberOfSimultaneousProjectiles: number,
    missileOptions?: {
      fireAndForget: boolean;
      missileTravelTimeToTarget: number;
    }
  ) {
    // number of shots divided by number of shots per salvo rounded up
    const numberOfReloads = Math.ceil(shotsToKill / salvoLength) - 1;
    const totalTimeReloading = numberOfReloads * reloadTime;

    let missileTravelTime = 0;
    let flightTimeOfOneMissile;

    if (missileOptions) {
      const isFireAndForget = missileOptions.fireAndForget;

      flightTimeOfOneMissile = missileOptions.missileTravelTimeToTarget;

      if (isFireAndForget) {
        missileTravelTime = flightTimeOfOneMissile;
      } else {
        missileTravelTime = flightTimeOfOneMissile * shotsToKill;
      }
    }

    // number of shots to kill minus 1 (since the first shot doesn't need to wait for reload)
    let instancesOfTimeBetweenShots = shotsToKill - 1 - numberOfReloads;

    if (numberOfSimultaneousProjectiles > 1 && numberOfSimultaneousProjectiles <= salvoLength) {
      const burstsToKill = Math.ceil(shotsToKill / numberOfSimultaneousProjectiles);
      const numberOfTimeBetweenShots = burstsToKill - 1;
      instancesOfTimeBetweenShots = numberOfTimeBetweenShots - numberOfReloads;

      if (flightTimeOfOneMissile && flightTimeOfOneMissile > 0) {
        missileTravelTime = flightTimeOfOneMissile * burstsToKill;
      }
    }

    const totalTimeBetweenShots = instancesOfTimeBetweenShots * timeBetweenShots;
    const timeToKill = aimingTime + totalTimeReloading + totalTimeBetweenShots + missileTravelTime;

    return timeToKill;
  }

  private calculateTimeTravelledByMissileToTarget(
    distance: number,
    missileSpeed: number,
    missileAcceleration: number
  ): number {
    let time = 0;

    const timeTilMaxVelocity = missileSpeed / missileAcceleration;
    const distanceTravelledTilMaxVelocity =
      0.5 * missileAcceleration * timeTilMaxVelocity * timeTilMaxVelocity;

    if (distanceTravelledTilMaxVelocity > distance) {
      // missile never reaches max velocity
      time = Math.sqrt((2 * distance) / missileAcceleration);
    } else {
      // missile reaches max velocity
      const distanceTravelledAfterMaxVelocity = distance - distanceTravelledTilMaxVelocity;
      const timeAfterMaxVelocity = distanceTravelledAfterMaxVelocity / missileSpeed;
      time = timeTilMaxVelocity + timeAfterMaxVelocity;
    }

    return time;
  }

  applyAccuracyModifiers(
    baseAccuracy: number,
    isMoving: boolean,
    damageFamily: string,
    targetUnit: Unit,
    sourceVeterancy?: Veterancy,
    targetVeterancy?: Veterancy,
    cohesion?: Cohesion
  ) {
    let accuracy = baseAccuracy;

    // apply dodge first if applicable
    if (targetVeterancy) {
      const targetVeterancyModifier = DamageCalculator.getVeterancyModifier(targetVeterancy);
      accuracy = accuracy - ((targetVeterancyModifier?.dodgeBonus?.[1] || 0) * 100 || 0);
    }

    if (sourceVeterancy) {
      const sourceVeterancyModifier = DamageCalculator.getVeterancyModifier(sourceVeterancy);

      let accuracyModifier = sourceVeterancyModifier.staticAccuracy || ['+', 0];

      if (isMoving) {
        accuracyModifier = sourceVeterancyModifier.motionAccuracy || ['+', 0];
      }

      if (accuracyModifier[0] === '+') {
        accuracy = accuracy + accuracyModifier[1] * 100;
      } else if (accuracyModifier[0] === '-') {
        accuracy = accuracy + accuracyModifier[1] * 100;
      }
    }

    if (cohesion) {
      const cohesionModifier = DamageCalculator.getCohesionModifier(cohesion);
      accuracy = accuracy * cohesionModifier.accuracy;
    }

    let ecmToApply = 0;
    if (AFFECTED_BY_ECM.includes(damageFamily)) {
      ecmToApply = targetUnit.ecm || 0;
    }

    accuracy = accuracy * (1 + ecmToApply);
    accuracy = Math.min(accuracy, 100);
    return accuracy;
  }

  applyAimTimeModifiers(baseAimTime: number, sourceVeterancy?: Veterancy, cohesion?: Cohesion) {
    let aimTime = baseAimTime;

    if (sourceVeterancy) {
      const sourceVeterancyModifier = DamageCalculator.getVeterancyModifier(sourceVeterancy);
      aimTime = aimTime * (sourceVeterancyModifier.aimTime || 1);
    }

    if (cohesion) {
      const cohesionModifier = DamageCalculator.getCohesionModifier(cohesion);

      if ((cohesionModifier?.aimTime || 0) > 0) {
        aimTime = aimTime * (cohesionModifier?.aimTime || 0);
      }
    }

    return aimTime;
  }

  applyReloadTimeModifiers(
    baseReloadTime: number,
    sourceVeterancy?: Veterancy,
    cohesion?: Cohesion
  ) {
    let reloadTime = baseReloadTime;

    if (sourceVeterancy) {
      const sourceVeterancyModifier = DamageCalculator.getVeterancyModifier(sourceVeterancy);
      reloadTime = reloadTime * (sourceVeterancyModifier.reloadTime || 1);
    }

    if (cohesion) {
      const cohesionModifier = DamageCalculator.getCohesionModifier(cohesion);

      if ((cohesionModifier?.reloadTime || 0) > 0) {
        reloadTime = reloadTime * (cohesionModifier?.reloadTime || 0);
      }
    }

    return reloadTime;
  }

  /**
   * The source unit uses the weapon that does the most damage to the target unit.
   */
  getDamagePropertiesForWeaponAgainstTarget(
    sourceWeapon: Weapon,
    targetUnit: Unit,
    distance: number,
    side: Side,
    terrain: string,
    targetVeterancy?: Veterancy
  ) {
    let highestDamage = {
      damage: 0,
      multiplier: 0,
      suppression: 0,
      suppressionMultiplier: 0,
      simultaneousProjectiles: 0,
      family: '',
    };

    const numberOfDamageFamilies = sourceWeapon?.damageFamilies?.length || 0;

    /**
     * Loop through the damage families in the weapon
     * to find the one that does the most damage to the target unit.
     */
    for (let i = 0; i < numberOfDamageFamilies; i++) {
      const damageFamilyWithIndex = sourceWeapon?.damageFamilies[i];
      const {family: damageFamily} = extractDamageFamilyProperties(damageFamilyWithIndex);

      const _damageFamily = damageFamily;

      /**
       * START DAMAGE CALCULATION
       */
      const isArmourPiercingWeapon = ARMOUR_PIERCING_DAMAGE_FAMILIES.includes(damageFamily);

      let _damagePerHit = 0;
      isArmourPiercingWeapon ? (_damagePerHit = 1) : (_damagePerHit = sourceWeapon?.totalHeDamage);

      const damageTableProcessor = new DamageTableProcessor(this.damageTable);

      const _physicalDamageMultiplier = damageTableProcessor.getDamageMultiplier(
        {sourceWeapon: this.source.weapon, damageFamilyIndex: i},
        targetUnit,
        distance,
        side,
        terrain
      );

      _damagePerHit = _damagePerHit * _physicalDamageMultiplier;

      /**
       * END DAMAGE CALCULATION
       */

      /**
       * START SUPPRESSION CALCULATION
       */
      let _suppressionPerHit = sourceWeapon?.suppressDamages[i] * sourceWeapon.numberOfWeapons || 0;

      const _suppressionMultiplier = damageTableProcessor.getSuppressionMultiplier(
        {sourceWeapon: this.source.weapon, damageFamilyIndex: i},
        targetUnit,
        side
      );

      let _suppressionVeterancyMultiplier = 1;

      if (targetVeterancy) {
        _suppressionVeterancyMultiplier =
          VETERANCY_MODIFIERS_MAP[targetVeterancy as keyof typeof VETERANCY_MODIFIERS_MAP]
            ?.suppressionReceived || 1;
      }

      _suppressionPerHit =
        _suppressionPerHit * _suppressionMultiplier * _suppressionVeterancyMultiplier +
        EXTRA_SUPPRESSION_DAMAGE_PER_DAMAGE * Math.floor(_damagePerHit);

      /**
       * END SUPPRESSION CALCULATION
       */

      const _simultaneousProjectiles = sourceWeapon?.numberOfSimultaneousProjectiles[i];

      const _damageProperties = {
        damage: _damagePerHit,
        multiplier: _physicalDamageMultiplier,
        suppression: _suppressionPerHit,
        suppressionMultiplier: _suppressionMultiplier,
        simultaneousProjectiles: _simultaneousProjectiles,
        family: _damageFamily,
      };

      if (_damageProperties.damage > highestDamage.damage) {
        highestDamage = _damageProperties;
      }
    }

    return {
      physical: {
        family: highestDamage.family,
        damage: highestDamage.damage,
        multiplier: highestDamage.multiplier,
      },
      suppression: {
        damage: highestDamage.suppression,
        multiplier: highestDamage.suppressionMultiplier,
      },
      simulatenousProjectiles: highestDamage.simultaneousProjectiles,
    };
  }

  getAccuracy(distance: number, moving: boolean, movementType: MovementType) {
    const accuracyScaling = this.getAccuracyScaling(moving, movementType);
    if (!accuracyScaling) {
      return this.getBaseAccuracy(moving);
    }

    // find the two ranges that the distance is between
    let upperBoundAccuracy;
    let lowerBoundAccuracy;

    // if the distance is less than the minimum range, use the minimum range accuracy
    if (distance < accuracyScaling[0].distance) {
      upperBoundAccuracy = accuracyScaling[0];
      lowerBoundAccuracy = {
        accuracy: accuracyScaling[0].accuracy,
        distance: DamageCalculator.getMinRangeOfWeaponTargettingUnit(
          this.source.weapon,
          this.target
        ),
      };
    } else {
      for (let i = 0; i < accuracyScaling.length; i++) {
        const scalingItem = accuracyScaling[i];
        const nextScalingItem = accuracyScaling[i + 1];

        if (nextScalingItem === undefined) {
          upperBoundAccuracy = scalingItem;
          lowerBoundAccuracy = scalingItem;
          break;
        }

        if (distance >= scalingItem.distance && distance <= nextScalingItem.distance) {
          upperBoundAccuracy = scalingItem;
          lowerBoundAccuracy = nextScalingItem;
          break;
        }
      }
    }

    if (!upperBoundAccuracy || !lowerBoundAccuracy) {
      return this.getBaseAccuracy(moving);
    }

    // get the accuracy at the interpolation value
    const interpolationValue =
      (distance - lowerBoundAccuracy.distance) /
      (upperBoundAccuracy.distance - lowerBoundAccuracy.distance);

    // get the accuracy at the interpolation value
    const upperBoundAccuracyValue = upperBoundAccuracy.accuracy;
    const lowerBoundAccuracyValue = lowerBoundAccuracy.accuracy;

    const accuracy =
      lowerBoundAccuracyValue +
      (upperBoundAccuracyValue - lowerBoundAccuracyValue) * interpolationValue;

    return accuracy;
  }

  getAccuracyScaling(moving: boolean, movemementType: MovementType) {
    let scaling;

    if (moving) {
      scaling = this.source.weapon?.movingAccuracyScaling;
    } else {
      scaling = this.source.weapon?.staticAccuracyScaling;
    }

    if (!scaling) {
      return;
    }

    if (movemementType === MovementType.LAND) {
      return scaling.ground;
    } else if (movemementType === MovementType.PLANE) {
      return scaling.plane;
    } else if (movemementType === MovementType.HELICOPTER) {
      return scaling.helicopter;
    }

    return undefined;
  }

  getBaseAccuracy(moving: boolean) {
    if (moving) {
      return this.source.weapon?.movingAccuracy || 0;
    }

    return this.source.weapon?.staticAccuracy || 0;
  }

  static getMaxRangeOfWeaponTargettingUnit(weapon: Weapon, unit: Unit) {
    let maxRange = 0;
    const movemementType = unit?.movementType;

    if (movemementType === MovementType.LAND) {
      maxRange = weapon?.groundRange || 0;
    } else if (movemementType === MovementType.PLANE) {
      maxRange = weapon?.planeRange || 0;
    } else if (movemementType === MovementType.HELICOPTER) {
      maxRange = weapon?.helicopterRange || 0;
    }

    return maxRange;
  }

  static getMinRangeOfWeaponTargettingUnit(weapon: Weapon, unit: Unit) {
    let minRange = 0;
    const movemementType = unit?.movementType;

    if (movemementType === MovementType.LAND) {
      minRange = weapon?.groundMinRange || 0;
    } else if (movemementType === MovementType.PLANE) {
      minRange = weapon?.planeMinRange || 0;
    } else if (movemementType === MovementType.HELICOPTER) {
      minRange = weapon?.helicopterMinRange || 0;
    }

    return minRange;
  }

  static getVeterancyModifier(veterancy: Veterancy) {
    return VETERANCY_MODIFIERS_MAP[veterancy as keyof typeof VETERANCY_MODIFIERS_MAP];
  }

  static getCohesionModifier(cohesion: Cohesion) {
    return COHESION_MODIFIERS_MAP[cohesion as keyof typeof COHESION_MODIFIERS_MAP];
  }

  static canWeaponTargetUnit(weapon: Weapon, unit: Unit) {
    const maxRange = DamageCalculator.getMaxRangeOfWeaponTargettingUnit(weapon, unit);

    if (maxRange > 0) {
      return true;
    }

    return false;
  }

  static getVeterancyOptions(unit: Unit) {
    const xpBonuses = unit.xpBonuses;

    if (xpBonuses.includes('ExperienceLevelsPackDescriptor_XP_pack_SF')) {
      return SF_VETERANCIES;
    } else if (xpBonuses.includes('ExperienceLevelsPackDescriptor_XP_pack_artillery')) {
      return ARTY_VETERANCIES;
    } else if (xpBonuses.includes('ExperienceLevelsPackDescriptor_XP_pack_avion')) {
      return PLANE_VETERANCIES;
    } else {
      return VETERANCIES;
    }
  }

  static getCohesionOptions(unit: Unit) {
    if (unit.movementType === MovementType.PLANE) {
      return PLANE_COHESIONS;
    }
    return COHESIONS;
  }

  static getOccupiableTerrainsForUnit(unit: Unit) {
    const occupiableTerrains = unit?.occupiableTerrains.map(
      (terrain: string) => TERRAIN_NAMES_MAP[terrain as keyof typeof TERRAIN_NAMES_MAP] || terrain
    );

    return [...occupiableTerrains];
  }
}
