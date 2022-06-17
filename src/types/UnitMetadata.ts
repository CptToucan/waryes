import {UnitService} from '../services/unit';

export enum quality {
  BAD = 'Bad',
  MEDIOCRE = 'Mediocre',
  NORMAL = 'Normal',
  GOOD = 'Good',
  VERY_GOOD = 'Very Good',
  EXCEPTIONAL = 'Exceptional',
}

export type WeaponMetadata = {
  aiming: number;
  aircraft: number;
  ammunition: string;
  ground: number;
  he: number;
  helicopter: number;
  motion: number;
  name: string;
  penetration: number;
  rateOfFire: number;
  reload: number;
  salvoLength: number;
  static: number;
  supplyCost: number;
  suppress: number;
  type: string;
};

export interface UnitMetadataOptions {
  id: string;
  name: string;
  commandPoints: number;
  frontArmor: number;
  rearArmor: number;
  sideArmor: number;
  topArmor: number;
  strength: number;
  optics: quality;
  stealth: quality;
  revealInfluence: boolean;
  maxDmg: number;
  airOptics: quality;
  ecm: number;
  agility: number;
  trajectory: number;
  speed: number;
  roadSpeed: number;
  autonomy: number;
  fuel: number;
  supply: number;
  transport: number;
  weaponMetadata: WeaponMetadata[];
  version: string;
}

export class UnitMetadata {
  constructor(options: UnitMetadataOptions) {
    this.id = options.id;
    this._name = options.name;
    this.commandPoints = options.commandPoints;
    this.frontArmor = options.frontArmor;
    this.rearArmor = options.rearArmor;
    this.sideArmor = options.sideArmor;
    this.topArmor = options.topArmor;
    this.strength = options.strength;
    this.optics = options.optics;
    this.stealth = options.stealth;
    this.revealInfluence = options.revealInfluence;
    this.maxDmg = options.maxDmg;
    this.airOptics = options.airOptics;
    this.ecm = options.ecm;
    this.agility = options.agility;
    this.trajectory = options.trajectory;
    this.speed = options.speed;
    this.roadSpeed = options.roadSpeed;
    this.autonomy = options.autonomy;
    this.fuel = options.fuel;
    this.supply = options.supply;
    this.transport = options.transport;
    this.weaponMetadata = options.weaponMetadata;
    this.version = options.version;
  }

  id: string;
  private _name: string;
  public get name(): string {
    if (UnitService.selectedVersions.length > 1) {
      return `${this._name} - ${this.version}`;
    }

    return this._name;
  }

  commandPoints: number;
  frontArmor: number;
  rearArmor: number;
  sideArmor: number;
  topArmor: number;
  strength: number;
  optics: quality;
  stealth: quality;
  revealInfluence: boolean;
  maxDmg: number;
  airOptics: quality;
  ecm: number;
  agility: number;
  trajectory: number;
  speed: number;
  roadSpeed: number;
  autonomy: number;
  fuel: number;
  supply: number;
  transport: number;
  weaponMetadata: WeaponMetadata[];
  version: string;
}
