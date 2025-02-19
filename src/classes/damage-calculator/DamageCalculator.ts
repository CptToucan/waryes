import {Motion} from '../../lib/motion';
import {Side} from '../../lib/side';
import {TERRAIN_NAMES_MAP} from '../../lib/terrains';
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
// @ts-ignore
const MAX_SUPPRESSION = 500;

const RESERVIST_SPECIALTY = '_reservist';
const RESERVIST_SUPPRESSION_MULTIPLIER = 1.5;
const RESERVIST_AIM_TIME_MULTIPLIER = 1.2;
const RESERVIST_ACCURACY_DEBUFF = 5; // 5% accuracy debuff
const RESERVIST_RELOAD_TIME_MULTIPLIER = 1.15;


export type WeaponEvent = AimEvent | ReloadEvent | ShotEvent | MissileLaunchEvent | MissileHitEvent;

export interface AimEvent {
  time: number;
  type: 'aim';
  weapon: string;
  weaponName: string;
  duration: number;
}

export interface ReloadEvent {
  time: number;
  type: 'reload';
  weapon: string;
  weaponName: string;
  duration: number;
}

export interface ShotEvent {
  time: number;
  type: 'shot';
  weapon: string;
  weaponName: string;
  damage: number;
  accuracy: number;
  hit: boolean;
  remainingHp: number;
}

export interface MissileLaunchEvent {
  time: number;
  type: 'missile-launch';
  weapon: string;
  weaponName: string;
  duration: number;
}

export interface MissileHitEvent {
  time: number;
  type: 'missile-hit';
  weapon: string;
  weaponName: string;
  damage: number;
  missileTravelTimeToTarget: number;
  accuracy: number;
  hit: boolean;
  remainingHp: number;
}

export enum EventResultType {
  OPTIMAL = 'optimal',
  AVERAGE = 'average',
  SIMULATION = 'simulation',
}

export class DamageCalculator {
  constructor(source: {unit: Unit; weapons: Weapon[]}, target: Unit, damageTable: DamageTable) {
    this.source = source;
    this.target = target;
    this.damageTable = damageTable;
  }

  source: {
    unit: Unit;
    weapons: Weapon[];
  };

  target: Unit;
  damageTable: DamageTable;

  calculateWeaponProperties({
    weapon,
    distance,
    side,
    terrain,
    sourceVeterancy,
    targetVeterancy,
    motionType,
    cohesion,
  }: {
    weapon: Weapon;
    distance: number;
    side: Side;
    terrain: string;
    sourceVeterancy?: Veterancy;
    targetVeterancy?: Veterancy;
    motionType: Motion;
    cohesion?: Cohesion;
  }) {
    // can unit weapon target unit
    const canWeaponTargetUnit = DamageCalculator.canWeaponTargetUnit(weapon, this.target);

    if (!canWeaponTargetUnit) {
      return;
    }

    const maxRange = DamageCalculator.getMaxRangeOfWeaponTargettingUnit(weapon, this.target);
    const minRange = DamageCalculator.getMinRangeOfWeaponTargettingUnit(weapon, this.target);

    if (distance > maxRange || distance < minRange) {
      return;
    }

    const damageProperties = this.getDamagePropertiesForWeaponAgainstTarget(
      weapon,
      distance,
      side,
      terrain,
      targetVeterancy
    );

    // get missile speed and acceleration

    const accuracy = this.getAccuracyWithModifiers(
      weapon,
      distance,
      motionType,
      damageProperties.physical.family,
      sourceVeterancy,
      targetVeterancy,
      cohesion
    );

    const baseAimTime = weapon?.aimingTime || 0;
    const aimTime = this.applyAimTimeModifiers(baseAimTime, sourceVeterancy, cohesion);

    const baseReloadTime = weapon?.reloadTime || 0;
    const reloadTime = this.applyReloadTimeModifiers(baseReloadTime, sourceVeterancy, cohesion);

    const salvoLength = weapon?.salvoLength || 0;
    // timeBetweenSalvos is a misnomer here, it's actually the time between shots
    const timeBetweenShots = weapon?.timeBetweenSalvos || 0;

    // const shotsToKill = Math.ceil(healthOfUnit / damagePerShot);
    const accuracyAsDecimal = accuracy / 100;
    // const averageDamagePerShot = damagePerShot * accuracyAsDecimal;
    // const shotsToKillWithAccuracy = Math.ceil(healthOfUnit / averageDamagePerShot);

    const missileOptions = this.calculateMissileProperties(weapon, distance);

    return {
      damageProperties,
      aimTime,
      reloadTime,
      salvoLength,
      timeBetweenShots,
      accuracyAsDecimal,
      missileOptions,
    };
  }

  private processEvents(events: WeaponEvent[], totalHp: number): WeaponEvent[] {
    let eventsByTime = events.sort((a, b) => a.time - b.time);

    let remainingHp = totalHp;
    let eventIndex = 0;

    if (eventsByTime.length === 0) {
      return [];
    }


    let killIndex = 0;
    while (remainingHp > 0) {
      const event = eventsByTime[eventIndex];
      if (event.type === 'shot' || event.type === 'missile-hit') {
        if (event.hit) {
          remainingHp -= event.damage || 0;
        }
        event.remainingHp = remainingHp;
      }

      if (remainingHp <= 0) {
        killIndex = eventIndex;
        break;
      }

      eventIndex++;
    }

    // remove all events that happen after the target is dead
    eventsByTime = eventsByTime.slice(0, killIndex + 1);
    return eventsByTime;
  }

  /**
   * Generates a sequence of weapon events required to kill a target unit.
   *
   * @param distance - The distance between the source and the target.
   * @param side - The side from which the attack is coming.
   * @param terrain - The type of terrain where the attack takes place.
   * @param sourceVeterancy - The veterancy level of the source unit (optional).
   * @param targetVeterancy - The veterancy level of the target unit (optional).
   * @param motionType - The motion type of the target unit (default is Motion.STATIC).
   * @param cohesion - The cohesion level of the source unit (optional).
   * @param optimalResult - Whether to use optimal accuracy (default is false).
   * @returns An array of WeaponEvent objects representing the sequence of events leading to the target's destruction.
   */
  simulateKill(
    distance: number,
    side: Side,
    terrain: string,
    sourceVeterancy?: Veterancy,
    targetVeterancy?: Veterancy,
    motionType = Motion.STATIC,
    cohesion?: Cohesion,
    resultType: EventResultType = EventResultType.SIMULATION
  ) {
    // create an event array, this will keep track of WHEN things happen

    const events: WeaponEvent[] = [];

    let dpsMap: {
      [key: string]: number;
      totalDps: number;
    } = {totalDps: 0};

    const healthOfUnit = this.target.maxDamage || 0;

    for (const weapon of this.source.weapons) {
      const weaponProperties = this.calculateWeaponProperties({
        weapon,
        distance,
        side,
        terrain,
        sourceVeterancy,
        targetVeterancy,
        motionType,
        cohesion,
      });

      // if weapon is out of range, skip it
      if (!weaponProperties) {
        continue;
      }

      const {
        damageProperties,
        aimTime,
        reloadTime,
        salvoLength,
        timeBetweenShots,
        accuracyAsDecimal,
        missileOptions,
      } = weaponProperties;
      let damagePerShot = damageProperties.physical.damage;
      let accuracy = accuracyAsDecimal;

      if (resultType === EventResultType.OPTIMAL) {
        accuracy = 1;
      } else if (resultType === EventResultType.AVERAGE) {
        damagePerShot = damageProperties.physical.damage * accuracyAsDecimal;
        accuracy = 1;
      }

      const eventProperties = this.generateEventsForWeaponKill(healthOfUnit, {
        name: weapon.ammoDescriptorName,
        prettyName: weapon.weaponName,
        aimTime,
        reloadTime,
        timeBetweenShots,
        salvoLength,
        damagePerShot,
        accuracy,
        missileOptions,
        simultaneousProjectiles: damageProperties.simultaneousProjectiles,
      });

      events.push(
        ...eventProperties.events
      );

      dpsMap[weapon.ammoDescriptorName] = eventProperties.dps;
      dpsMap.totalDps += eventProperties.dps;
    }

    const eventsByTime = this.processEvents(events, healthOfUnit);

    return { events: eventsByTime, dpsMap };
  }

  /**
   * Generates a sequence of weapon events required to fully suppress a target unit.
   *
   * @param distance - The distance between the source and the target.
   * @param side - The side from which the attack is coming.
   * @param terrain - The type of terrain where the attack takes place.
   * @param sourceVeterancy - The veterancy level of the source unit (optional).
   * @param targetVeterancy - The veterancy level of the target unit (optional).
   * @param motionType - The motion type of the target unit (default is Motion.STATIC).
   * @param cohesion - The cohesion level of the source unit (optional).
   * @param optimalResult - Whether to use optimal accuracy (default is false).
   * @returns An array of WeaponEvent objects representing the sequence of events leading to the target's destruction.
   */
  simulateSuppression(
    distance: number,
    side: Side,
    terrain: string,
    sourceVeterancy?: Veterancy,
    targetVeterancy?: Veterancy,
    motionType = Motion.STATIC,
    cohesion?: Cohesion,
    resultType: EventResultType = EventResultType.SIMULATION
  ) {
    // create an event array, this will keep track of WHEN things happen

    const events: WeaponEvent[] = [];
    let dpsMap: {
      [key: string]: number;
      totalDps: number;
    } = {totalDps: 0};
    const healthOfUnit = MAX_SUPPRESSION;

    for (const weapon of this.source.weapons) {
      const weaponProperties = this.calculateWeaponProperties({
        weapon,
        distance,
        side,
        terrain,
        sourceVeterancy,
        targetVeterancy,
        motionType,
        cohesion,
      });

      // if weapon is out of range, skip it
      if (!weaponProperties) {
        continue;
      }

      const {
        damageProperties,
        aimTime,
        reloadTime,
        salvoLength,
        timeBetweenShots,
        accuracyAsDecimal,
        missileOptions,
      } = weaponProperties;

      let damagePerShot = damageProperties.suppression.damage;
      let accuracy = accuracyAsDecimal;

      if (resultType === EventResultType.OPTIMAL) {
        accuracy = 1;
      } else if (resultType === EventResultType.AVERAGE) {
        damagePerShot = damageProperties.suppression.damage * accuracyAsDecimal;
        accuracy = 1;
      }

      const eventProperties = this.generateEventsForWeaponKill(healthOfUnit, {
        name: weapon.ammoDescriptorName,
        prettyName: weapon.weaponName,
        aimTime,
        reloadTime,
        timeBetweenShots,
        salvoLength,
        damagePerShot,
        accuracy,
        missileOptions,
        simultaneousProjectiles: damageProperties.simultaneousProjectiles,
      });

      events.push(
        ...eventProperties.events
      );

      events.push(
        ...eventProperties.events
      );

      dpsMap[weapon.ammoDescriptorName] = eventProperties.dps;
      dpsMap.totalDps += eventProperties.dps;
    }

    const eventsByTime = this.processEvents(events, healthOfUnit);

    return { events: eventsByTime, dpsMap };
  }

  public calculateMissileProperties(weapon: Weapon, distance: number) {
    const missileSpeed = weapon?.missileProperties?.maxMissileSpeed;
    const missileAcceleration = weapon?.missileProperties?.maxMissileAcceleration;

    let missileTravelTimeToTarget;

    // @ts-ignore
    let missileOptions;

    if (missileSpeed && missileAcceleration) {
      missileTravelTimeToTarget = this.calculateTimeTravelledByMissileToTarget(
        distance,
        missileSpeed,
        missileAcceleration
      );

      missileOptions = {
        fireAndForget: weapon?.traits?.includes('F&F') || false,
        missileTravelTimeToTarget,
      };
    }
    return missileOptions;
  }

  public getAccuracyWithModifiers(
    weapon: Weapon,
    distance: number,
    motionType: Motion,
    physicalDamageFamily: string,
    sourceVeterancy: Veterancy | undefined,
    targetVeterancy: Veterancy | undefined,
    cohesion: Cohesion | undefined
  ) {
    const baseAccuracy = this.getAccuracy(weapon, distance, motionType);
    const accuracy = this.applyAccuracyModifiers(
      baseAccuracy,
      motionType,
      physicalDamageFamily,
      sourceVeterancy,
      targetVeterancy,
      cohesion
    );
    return accuracy;
  }

  generateEventsForWeaponKill(
    baseHp: number,
    weaponProperties: {
      name: string;
      prettyName: string;
      aimTime: number;
      reloadTime: number;
      timeBetweenShots: number;
      salvoLength: number;
      damagePerShot: number;
      accuracy: number;
      simultaneousProjectiles: number;
      missileOptions?: {
        fireAndForget: boolean;
        missileTravelTimeToTarget: number;
      };
    }
  ) {
    let remainingHp = baseHp;
    let eventsForWeapon: WeaponEvent[] = [];

    if (weaponProperties.damagePerShot > 0.01) {
      if (weaponProperties.missileOptions) {
        const isFireAndForget = weaponProperties.missileOptions.fireAndForget;
        const flightTimeOfOneMissile = weaponProperties.missileOptions.missileTravelTimeToTarget;

        if (isFireAndForget) {
          eventsForWeapon = this.generateFireAndForgetMissileEvents(remainingHp, {
            name: weaponProperties.name,
            prettyName: weaponProperties.prettyName,
            aimTime: weaponProperties.aimTime,
            reloadTime: weaponProperties.reloadTime,
            timeBetweenShots: weaponProperties.timeBetweenShots,
            salvoLength: weaponProperties.salvoLength,
            damagePerShot: weaponProperties.damagePerShot,
            accuracy: weaponProperties.accuracy,
            flightTimeOfOneMissile,
            simultaneousProjectiles: weaponProperties.simultaneousProjectiles,
          });

        } else {
          eventsForWeapon = this.generateGuidedMissileEvents(remainingHp, {
            name: weaponProperties.name,
            prettyName: weaponProperties.prettyName,
            aimTime: weaponProperties.aimTime,
            reloadTime: weaponProperties.reloadTime,
            timeBetweenShots: weaponProperties.timeBetweenShots,
            salvoLength: weaponProperties.salvoLength,
            damagePerShot: weaponProperties.damagePerShot,
            accuracy: weaponProperties.accuracy,
            flightTimeOfOneMissile,
            simultaneousProjectiles: weaponProperties.simultaneousProjectiles,
          });
        }
      } else {
        eventsForWeapon = this.generateGunEvents(remainingHp, {
          name: weaponProperties.name,
          prettyName: weaponProperties.prettyName,
          aimTime: weaponProperties.aimTime,
          reloadTime: weaponProperties.reloadTime,
          timeBetweenShots: weaponProperties.timeBetweenShots,
          salvoLength: weaponProperties.salvoLength,
          damagePerShot: weaponProperties.damagePerShot,
          accuracy: weaponProperties.accuracy,
          simultaneousProjectiles: weaponProperties.simultaneousProjectiles,
        });


      }
    }

    const dps = this.calculateDPS(eventsForWeapon, remainingHp);

    return {
      events: eventsForWeapon,
      dps,
    }
  }

  calculateDPS(_events: WeaponEvent[], _startingHealth: number) {
    if (_events.length === 0) {
      return 0;
    }

    const events = [..._events];
    // throw away the aim event
    events.shift();

    const startTime = events[0].time;
    const endTime = events[events.length - 1].time;
    const startingHealth = _startingHealth;

    // find last event with remainingHp present
    const lastEventWithHp = [...events].reverse().find((event): event is ShotEvent | MissileHitEvent => 
      (event.type === 'shot' || event.type === 'missile-hit') && event.remainingHp !== undefined
    );

    if(!lastEventWithHp) {
      return 0;
    }

    const endingHealth = lastEventWithHp.remainingHp;

    const timeElapsed = endTime - startTime;
    const healthLost = startingHealth - endingHealth;
    const dps = healthLost / timeElapsed;


    return dps;
  }

  /**
   * Generates a sequence of weapon events based on the provided weapon properties and target's hit points.
   *
   * @param hp - The hit points of the target.
   * @param weaponProperties - An object containing the properties of the weapon.
   * @param weaponProperties.name - The internal name of the weapon.
   * @param weaponProperties.prettyName - The display name of the weapon.
   * @param weaponProperties.aimTime - The time required to aim the weapon.
   * @param weaponProperties.reloadTime - The time required to reload the weapon.
   * @param weaponProperties.timeBetweenShots - The time between consecutive shots in a salvo.
   * @param weaponProperties.salvoLength - The number of shots in a salvo.
   * @param weaponProperties.damagePerShot - The damage dealt by each shot.
   * @param weaponProperties.accuracy - The accuracy of the weapon, represented as a percentage.
   * @param weaponProperties.simultaneousProjectiles - The number of projectiles fired simultaneously.
   * @returns An array of weapon events detailing the sequence of actions taken by the weapon.
   */
  generateGunEvents(
    hp: number,
    weaponProperties: {
      name: string;
      prettyName: string;
      aimTime: number;
      reloadTime: number;
      timeBetweenShots: number;
      salvoLength: number;
      damagePerShot: number;
      accuracy: number;
      simultaneousProjectiles: number;
    }
  ) {
    const events: WeaponEvent[] = [];
    let time = 0;

    events.push({
      time,
      type: 'aim',
      duration: weaponProperties.aimTime,
      weapon: weaponProperties.name,
      weaponName: weaponProperties.prettyName,
    });

    time += weaponProperties.aimTime;

    while (hp > 0) {
      for (let shotNumber = 0; shotNumber < weaponProperties.salvoLength; shotNumber++) {
        for (let j = 0; j < weaponProperties.simultaneousProjectiles; j++) {
          const didShotHit = DamageCalculator.didEventHit(weaponProperties.accuracy);

          if (didShotHit) hp -= weaponProperties.damagePerShot;

          events.push({
            time,
            type: 'shot',
            damage: weaponProperties.damagePerShot,
            accuracy: weaponProperties.accuracy,
            weapon: weaponProperties.name,
            weaponName: weaponProperties.prettyName,
            hit: didShotHit,
            remainingHp: hp,
          });

          if (j > 1) {
            shotNumber++;
          }

          if (hp <= 0) {
            break;
          }
        }

        if (hp <= 0) {
          break;
        }

        // only add time between shots if it's about to reload
        if (shotNumber < weaponProperties.salvoLength - 1) {
          time += weaponProperties.timeBetweenShots;
        }
      }

      if (hp <= 0) {
        break;
      }

      events.push({
        time,
        type: 'reload',
        duration: weaponProperties.reloadTime,
        weapon: weaponProperties.name,
        weaponName: weaponProperties.prettyName,
      });
      time += weaponProperties.reloadTime;
    }

    return events;
  }

  /**
   * Generates a sequence of events for a fire-and-forget missile weapon system.
   *
   * @param hp - The hit points of the target.
   * @param weaponProperties - An object containing the properties of the weapon.
   * @param weaponProperties.name - The internal name of the weapon.
   * @param weaponProperties.prettyName - The display name of the weapon.
   * @param weaponProperties.aimTime - The time required to aim the weapon.
   * @param weaponProperties.reloadTime - The time required to reload the weapon.
   * @param weaponProperties.timeBetweenShots - The time between consecutive shots in a salvo.
   * @param weaponProperties.salvoLength - The number of shots in a single salvo.
   * @param weaponProperties.damagePerShot - The damage dealt by each shot.
   * @param weaponProperties.accuracy - The accuracy of the weapon, as a percentage.
   * @param weaponProperties.flightTimeOfOneMissile - The time it takes for a missile to reach its target.
   * @param weaponProperties.simultaneousProjectiles - The number of projectiles launched simultaneously.
   * @returns An array of `WeaponEvent` objects representing the sequence of events.
   */
  generateFireAndForgetMissileEvents(
    hp: number,
    weaponProperties: {
      name: string;
      prettyName: string;
      aimTime: number;
      reloadTime: number;
      timeBetweenShots: number;
      salvoLength: number;
      damagePerShot: number;
      accuracy: number;
      flightTimeOfOneMissile: number;
      simultaneousProjectiles: number;
    }
  ) {
    const events: WeaponEvent[] = [];
    let time = 0;

    events.push({
      time,
      type: 'aim',
      weapon: weaponProperties.name,
      duration: weaponProperties.aimTime,
      weaponName: weaponProperties.prettyName,
    });

    time += weaponProperties.aimTime;

    while (hp > 0) {
      for (let shotNumber = 0; shotNumber < weaponProperties.salvoLength; shotNumber++) {
        const timeWhenNextShotReady = time + weaponProperties.timeBetweenShots;
        const timeWhenMissileHitsTarget = time + weaponProperties.flightTimeOfOneMissile;

        for (let j = 0; j < weaponProperties.simultaneousProjectiles; j++) {
          events.push({
            time,
            type: 'missile-launch',
            weapon: weaponProperties.name,
            weaponName: weaponProperties.prettyName,
            duration: weaponProperties.flightTimeOfOneMissile,
          });

          const didMissileHit = DamageCalculator.didEventHit(weaponProperties.accuracy);
          if (didMissileHit) hp -= weaponProperties.damagePerShot;

          events.push({
            time: timeWhenMissileHitsTarget,
            type: 'missile-hit',
            damage: weaponProperties.damagePerShot,
            weapon: weaponProperties.name,
            missileTravelTimeToTarget: weaponProperties.flightTimeOfOneMissile,
            accuracy: weaponProperties.accuracy,
            weaponName: weaponProperties.prettyName,
            hit: didMissileHit,
            remainingHp: hp,
          });

          if (j > 1) {
            shotNumber++;
          }
        }

        if (shotNumber < weaponProperties.salvoLength - 1) {
          time = timeWhenNextShotReady;
        }
      }

      if (hp <= 0) {
        break;
      }

      time += weaponProperties.reloadTime;

      events.push({
        time,
        type: 'reload',
        duration: weaponProperties.reloadTime,
        weapon: weaponProperties.name,
        weaponName: weaponProperties.prettyName,
      });
    }

    return events;
  }

  /**
   * Generates a sequence of events for a guided missile attack based on the given weapon properties and target HP.
   *
   * @param hp - The hit points of the target.
   * @param weaponProperties - An object containing the properties of the weapon.
   * @param weaponProperties.name - The internal name of the weapon.
   * @param weaponProperties.prettyName - The display name of the weapon.
   * @param weaponProperties.aimTime - The time required to aim the weapon.
   * @param weaponProperties.reloadTime - The time required to reload the weapon.
   * @param weaponProperties.timeBetweenShots - The time between consecutive shots in a salvo.
   * @param weaponProperties.salvoLength - The number of shots in a salvo.
   * @param weaponProperties.damagePerShot - The damage dealt by each shot.
   * @param weaponProperties.accuracy - The accuracy of the weapon.
   * @param weaponProperties.flightTimeOfOneMissile - The flight time of a single missile.
   * @param weaponProperties.simultaneousProjectiles - The number of projectiles launched simultaneously.
   * @returns An array of weapon events detailing the sequence of actions taken during the attack.
   */
  generateGuidedMissileEvents(
    hp: number,
    weaponProperties: {
      name: string;
      prettyName: string;
      aimTime: number;
      reloadTime: number;
      timeBetweenShots: number;
      salvoLength: number;
      damagePerShot: number;
      accuracy: number;
      flightTimeOfOneMissile: number;
      simultaneousProjectiles: number;
    }
  ) {
    const events: WeaponEvent[] = [];
    let time = 0;

    events.push({
      time,
      type: 'aim',
      duration: weaponProperties.aimTime,
      weapon: weaponProperties.name,
      weaponName: weaponProperties.prettyName,
    });

    time += weaponProperties.aimTime;

    while (hp > 0) {
      for (let shotNumber = 0; shotNumber < weaponProperties.salvoLength; shotNumber++) {
        const timeWhenMissileHitsTarget = time + weaponProperties.flightTimeOfOneMissile;

        for (let j = 0; j < weaponProperties.simultaneousProjectiles; j++) {
          events.push({
            time,
            type: 'missile-launch',
            weapon: weaponProperties.name,
            weaponName: weaponProperties.prettyName,
            duration: weaponProperties.flightTimeOfOneMissile,
          });

          const didMissileHit = DamageCalculator.didEventHit(weaponProperties.accuracy);

          if (didMissileHit) hp -= weaponProperties.damagePerShot;

          events.push({
            time: timeWhenMissileHitsTarget,
            type: 'missile-hit',
            damage: weaponProperties.damagePerShot,
            weapon: weaponProperties.name,
            missileTravelTimeToTarget: weaponProperties.flightTimeOfOneMissile,
            accuracy: weaponProperties.accuracy,
            weaponName: weaponProperties.prettyName,
            hit: didMissileHit,
            remainingHp: hp,
          });

          if (j > 1) {
            shotNumber++;
          }
        }

        time = timeWhenMissileHitsTarget;

        if (shotNumber < weaponProperties.salvoLength - 1) {
          time += weaponProperties.timeBetweenShots;
        }

        if (hp <= 0) {
          break;
        }
      }

      if (hp <= 0) {
        break;
      }

      events.push({
        time,
        type: 'reload',
        duration: weaponProperties.reloadTime,
        weapon: weaponProperties.name,
        weaponName: weaponProperties.prettyName,
      });
      time += weaponProperties.reloadTime;
    }

    return events;
  }

  /**
   * Calculates the time taken for a missile to travel a given distance to its target.
   *
   * @param distance - The distance to the target in meters.
   * @param missileSpeed - The maximum speed of the missile in meters per second.
   * @param missileAcceleration - The acceleration of the missile in meters per second squared.
   * @returns The time in seconds for the missile to reach the target.
   */
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

  /**
   * Applies various accuracy modifiers to the base accuracy value.
   *
   * @param baseAccuracy - The initial accuracy value before any modifiers.
   * @param motionType - The motion state of the unit (e.g., moving or static).
   * @param damageFamily - The family/type of damage being calculated.
   * @param sourceVeterancy - The veterancy level of the source unit (optional).
   * @param targetVeterancy - The veterancy level of the target unit (optional).
   * @param cohesion - The cohesion level of the unit (optional).
   * @returns The modified accuracy value after applying all relevant modifiers.
   */
  applyAccuracyModifiers(
    baseAccuracy: number,
    motionType: Motion,
    damageFamily: string,
    sourceVeterancy?: Veterancy,
    targetVeterancy?: Veterancy,
    cohesion?: Cohesion
  ) {
    const targetUnit = this.target;
    let accuracy = baseAccuracy;
    const isMoving = motionType === Motion.MOVING;

    if(DamageCalculator.isUnitReservist(this.source.unit)) {
      accuracy = accuracy - RESERVIST_ACCURACY_DEBUFF;
    }

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

  /**
   * Applies aim time modifiers based on source veterancy and cohesion.
   *
   * @param baseAimTime - The base aim time to be modified.
   * @param sourceVeterancy - Optional veterancy level of the source, which may affect the aim time.
   * @param cohesion - Optional cohesion level, which may also affect the aim time.
   * @returns The modified aim time after applying the veterancy and cohesion modifiers.
   */
  applyAimTimeModifiers(baseAimTime: number, sourceVeterancy?: Veterancy, cohesion?: Cohesion) {
    let aimTime = baseAimTime;

    if (DamageCalculator.isUnitReservist(this.source.unit)) {
      aimTime = aimTime * RESERVIST_AIM_TIME_MULTIPLIER;
    }


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

  /**
   * Applies reload time modifiers based on veterancy and cohesion.
   *
   * @param baseReloadTime - The base reload time before any modifiers.
   * @param sourceVeterancy - Optional veterancy level that may affect reload time.
   * @param cohesion - Optional cohesion level that may affect reload time.
   * @returns The modified reload time after applying veterancy and cohesion modifiers.
   */
  applyReloadTimeModifiers(
    baseReloadTime: number,
    sourceVeterancy?: Veterancy,
    cohesion?: Cohesion
  ) {
    let reloadTime = baseReloadTime;

    if (DamageCalculator.isUnitReservist(this.source.unit)) {
      reloadTime = reloadTime * RESERVIST_RELOAD_TIME_MULTIPLIER
    }

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
  /**
   * Calculates the damage properties for a given weapon against a target.
   *
   * @param sourceWeapon - The weapon being used to calculate damage.
   * @param distance - The distance between the weapon and the target.
   * @param side - The side of the target being hit.
   * @param terrain - The terrain type where the target is located.
   * @param targetVeterancy - (Optional) The veterancy level of the target.
   * @returns An object containing the highest damage properties for the weapon against the target, including physical damage, suppression damage, and simultaneous projectiles.
   */
  getDamagePropertiesForWeaponAgainstTarget(
    sourceWeapon: Weapon,
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
        {sourceWeapon: sourceWeapon, damageFamilyIndex: i},
        this.target,
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
        {sourceWeapon: sourceWeapon, damageFamilyIndex: i},
        this.target,
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

      if (DamageCalculator.isUnitReservist(this.target)) {
        _suppressionPerHit = _suppressionPerHit * RESERVIST_SUPPRESSION_MULTIPLIER;
      }

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
      simultaneousProjectiles: highestDamage.simultaneousProjectiles,
    };
  }

  /**
   * Calculates the accuracy of a weapon based on the distance to the target and the motion type.
   *
   * @param weapon - The weapon for which the accuracy is being calculated.
   * @param distance - The distance to the target.
   * @param motionType - The motion type of the target (e.g., moving or stationary).
   * @returns The calculated accuracy as a number.
   */
  getAccuracy(weapon: Weapon, distance: number, motionType: Motion) {
    const moving = motionType === Motion.MOVING;
    const movementType = this.target.movementType;

    const accuracyScaling = this.getAccuracyScaling(weapon, moving, movementType);
    if (!accuracyScaling) {
      return this.getBaseAccuracy(weapon, moving);
    }

    const minRange = DamageCalculator.getMinRangeOfWeaponTargettingUnit(weapon, this.target);

    // find the two ranges that the distance is between
    let upperBoundAccuracy;
    let lowerBoundAccuracy;

    // if the distance is less than the minimum range, use the minimum range accuracy
    if (distance < accuracyScaling[0].distance) {
      upperBoundAccuracy = accuracyScaling[0];
      lowerBoundAccuracy = {
        accuracy: accuracyScaling[0].accuracy,
        distance: minRange
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
      return this.getBaseAccuracy(weapon, moving);
    }

    // get the accuracy at the interpolation value
    const interpolationValue =
      (distance - lowerBoundAccuracy.distance) /
      (upperBoundAccuracy.distance - lowerBoundAccuracy.distance);

    // get the accuracy at the interpolation value
    const upperBoundAccuracyValue = upperBoundAccuracy.accuracy;
    const lowerBoundAccuracyValue = lowerBoundAccuracy.accuracy;

    if(distance < minRange) {
      return 0;
    }

    const accuracy =
      lowerBoundAccuracyValue +
      (upperBoundAccuracyValue - lowerBoundAccuracyValue) * interpolationValue;

    return accuracy;
  }

  /**
   * Calculates the accuracy scaling for a given weapon based on its movement state and type.
   *
   * @param weapon - The weapon for which the accuracy scaling is being calculated.
   * @param moving - A boolean indicating whether the weapon is moving.
   * @param movemementType - The type of movement (e.g., LAND, PLANE, HELICOPTER).
   * @returns The accuracy scaling value for the specified movement type, or undefined if no scaling is available.
   */
  getAccuracyScaling(weapon: Weapon, moving: boolean, movemementType: MovementType) {
    let scaling;

    if (moving) {
      scaling = weapon?.movingAccuracyScaling;
    } else {
      scaling = weapon?.staticAccuracyScaling;
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

  /**
   * Calculates the base accuracy of a weapon based on its state (moving or static).
   *
   * @param weapon - The weapon for which the accuracy is being calculated.
   * @param moving - A boolean indicating whether the weapon is moving.
   * @returns The base accuracy of the weapon. If the weapon is moving, returns the moving accuracy; otherwise, returns the static accuracy.
   */
  getBaseAccuracy(weapon: Weapon, moving: boolean) {
    if (moving) {
      return weapon?.movingAccuracy || 0;
    }

    return weapon?.staticAccuracy || 0;
  }

  /**
   * Calculates the maximum range of a weapon when targeting a specific unit based on the unit's movement type.
   *
   * @param weapon - The weapon for which the range is being calculated.
   * @param unit - The unit that is being targeted by the weapon.
   * @returns The maximum range of the weapon when targeting the unit.
   */
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

  /**
   * Calculates the minimum range of a weapon when targeting a specific unit based on the unit's movement type.
   *
   * @param weapon - The weapon for which the minimum range is being calculated.
   * @param unit - The unit that is being targeted by the weapon.
   * @returns The minimum range of the weapon when targeting the specified unit.
   */
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

  /**
   * Determines if an event hits based on the given accuracy.
   *
   * @param accuracy - A number representing the accuracy of the event, where 0 is 0% and 1 is 100%.
   * @returns A boolean indicating whether the event hit (true) or missed (false).
   */
  static didEventHit(accuracy: number) {
    const randomNumber = Math.random();

    if (randomNumber <= accuracy) {
      return true;
    }

    return false;
  }

  /**
   * Retrieves the modifier value associated with a given veterancy level.
   *
   * @param veterancy - The veterancy level for which to get the modifier.
   * @returns The modifier value corresponding to the provided veterancy level.
   */
  static getVeterancyModifier(veterancy: Veterancy) {
    return VETERANCY_MODIFIERS_MAP[veterancy as keyof typeof VETERANCY_MODIFIERS_MAP];
  }

  /**
   * Retrieves the cohesion modifier value from the COHESION_MODIFIERS_MAP based on the provided cohesion key.
   *
   * @param {Cohesion} cohesion - The cohesion key for which the modifier value is to be retrieved.
   * @returns {number} The modifier value corresponding to the provided cohesion key.
   */
  static getCohesionModifier(cohesion: Cohesion) {
    return COHESION_MODIFIERS_MAP[cohesion as keyof typeof COHESION_MODIFIERS_MAP];
  }

  /**
   * Determines if a given weapon can target a specific unit.
   *
   * @param weapon - The weapon to check.
   * @param unit - The unit to be targeted.
   * @returns A boolean indicating whether the weapon can target the unit.
   */
  static canWeaponTargetUnit(weapon: Weapon, unit: Unit) {
    const maxRange = DamageCalculator.getMaxRangeOfWeaponTargettingUnit(weapon, unit);

    if (maxRange > 0) {
      return true;
    }

    return false;
  }

  /**
   * Checks if the given unit has the reservist specialty.
   *
   * @param unit - The unit to check for the reservist specialty.
   * @returns `true` if the unit has the reservist specialty, otherwise `false`.
   */
  static isUnitReservist(unit: Unit) {
    return unit.specialities.includes(RESERVIST_SPECIALTY);
  }

  /**
   * Retrieves the veterancy options for a given unit based on its experience bonuses.
   *
   * @param {Unit} unit - The unit for which to retrieve veterancy options.
   * @returns {Veterancy[]} An array of veterancy options corresponding to the unit's experience bonuses.
   */
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

  /**
   * Retrieves the cohesion options for a given unit based on its movement type.
   *
   * @param unit - The unit for which to get the cohesion options.
   * @returns An array of cohesion options specific to the unit's movement type.
   *          If the unit's movement type is `MovementType.PLANE`, it returns `PLANE_COHESIONS`.
   *          Otherwise, it returns `COHESIONS`.
   */
  static getCohesionOptions(unit: Unit) {
    if (unit.movementType === MovementType.PLANE) {
      return PLANE_COHESIONS;
    }
    return COHESIONS;
  }

  /**
   * Retrieves the list of occupiable terrains for a given unit.
   *
   * This method maps the unit's occupiable terrains to their corresponding names
   * using the `TERRAIN_NAMES_MAP`. If a terrain name is not found in the map,
   * it will be returned as is.
   *
   * @param unit - The unit for which to retrieve the occupiable terrains.
   * @returns An array of occupiable terrain names for the given unit.
   */
  static getOccupiableTerrainsForUnit(unit: Unit) {
    const occupiableTerrains = unit?.occupiableTerrains.map(
      (terrain: string) => TERRAIN_NAMES_MAP[terrain as keyof typeof TERRAIN_NAMES_MAP] || terrain
    );

    return [...occupiableTerrains];
  }
}
