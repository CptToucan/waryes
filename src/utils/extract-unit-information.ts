import { WarnoWeapon, WarnoPlatoon, WarnoUnit, WarnoStatic } from "../types/";

export const platoonStats = [
  'strength',
  'optics',
  'stealth',
  'revealInfluence',
  'maxDmg',
  'airOptics',
  'ecm',
  'agility',
  'trajectory',
  'speed',
  'roadSpeed',
  'autonomy',
  'fuel',
  'supply',
  'transport',
];

export const weaponStats = [
  "aiming",
  "aircraft",
  "ammunition",
  "ground",
  "he",
  "helicopter",
  "motion",
  "name",
  "penetration",
  "rateOfFire",
  "reload",
  "salvoLength",
  "static",
  "supplyCost",
  "suppress",
  "type"
];

export const staticStats = [
  "commandPoints",
  "frontArmor",
  "rearArmor",
  "sideArmor",
  "topArmor"
]

export function extractUnitInformation(unit: WarnoUnit) {
  const allWeaponsInformation: WarnoWeapon[] = [
  ];
  const platoonInformation: WarnoPlatoon = {};
  const staticInformation: WarnoStatic = {};

  for (const attribute in unit) {
    if(attribute === "weaponOne" || attribute === "weaponTwo" || attribute === "weaponThree") {
      allWeaponsInformation.push(unit[attribute]);
    } else if (platoonStats.includes(attribute)) {
      platoonInformation[attribute] = unit[attribute];
    } else {
      staticInformation[attribute] = unit[attribute];
    }
  }
  return {staticInformation, allWeaponsInformation, platoonInformation};
}