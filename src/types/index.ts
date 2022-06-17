import { BooleanFieldMetadata, EnumFieldMetadata, NumberFieldMetadata, StringFieldMetadata } from "../metadata";
import { AbstractFieldMetadata } from "../metadata/AbstractFieldMetadata";
import { FilterMetadata } from "../metadata/FilterMetadata";
import { UnitMetadata } from "./UnitMetadata";

enum DashboardType {
  UNIT,
  CHART,
}

type Dashboard = {
  id: string
  type: DashboardType,
  data: unknown
}

export enum fieldType {
  STATIC,
  WEAPON,
  PLATOON
}

export type metadataMap = {
  [key: string]: AbstractFieldMetadata<unknown>
}


export type metadataStore = {
  name: StringFieldMetadata;
  commandPoints: NumberFieldMetadata;
  frontArmor: NumberFieldMetadata;
  rearArmor: NumberFieldMetadata;
  sideArmor: NumberFieldMetadata;
  topArmor: NumberFieldMetadata;
  aiming: NumberFieldMetadata;
  aircraft: NumberFieldMetadata;
  ammunition: StringFieldMetadata;
  ground: NumberFieldMetadata;
  he: NumberFieldMetadata;
  helicopter: NumberFieldMetadata;
  motion: NumberFieldMetadata;
  weaponName: StringFieldMetadata;
  penetration: NumberFieldMetadata;
  rateOfFire: NumberFieldMetadata;
  reload: NumberFieldMetadata;
  salvoLength: NumberFieldMetadata;
  static: NumberFieldMetadata;
  supplyCost: NumberFieldMetadata;
  suppress: NumberFieldMetadata;
  type: StringFieldMetadata;
  strength: NumberFieldMetadata;
  optics: EnumFieldMetadata;
  stealth: EnumFieldMetadata;
  revealInfluence: BooleanFieldMetadata;
  maxDmg: NumberFieldMetadata;
  airOptics: EnumFieldMetadata;
  ecm: NumberFieldMetadata;
  agility: NumberFieldMetadata;
  trajectory: NumberFieldMetadata;
  speed: NumberFieldMetadata;
  roadSpeed: NumberFieldMetadata;
  autonomy: NumberFieldMetadata;
  fuel: NumberFieldMetadata;
  supply: NumberFieldMetadata;
  transport: NumberFieldMetadata;
};

export enum operator {
  EQUALS = "Equals",
  NOT_EQUALS = "Not Equals",
  LIKE = "Like",
  NOT_LIKE = "Not Like",
  IN_LIST = "In List",
  NOT_IN_LIST = "Not In List",
  LESS_THAN = "Less Than",
  GREATER_THAN = "Greater Than",
  RANGE = "Range"
}

export type operatorMap = {
  [key in operator]: (filter: FilterMetadata<unknown>) => (value: UnitMetadata, index: number, array: UnitMetadata[]) => boolean;
}

//(value: UnitMetadata, index: number, array: UnitMetadata[]) => boolean



type UrlWatcherCallback = (newUrl: string, oldUrl: string) => void;

export { DashboardType, Dashboard, UrlWatcherCallback };

export { UnitMetadata,  WeaponMetadata, quality, UnitMetadataOptions} from "./UnitMetadata";
