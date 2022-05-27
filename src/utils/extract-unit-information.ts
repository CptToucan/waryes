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
  const weaponOneInformation: WarnoWeapon = {};
  const weaponTwoInformation: WarnoWeapon = {};
  const weaponThreeInformation: WarnoWeapon = {};
  const allWeaponsInformation: WarnoWeapon[] = [
    weaponOneInformation,
    weaponTwoInformation,
    weaponThreeInformation,
  ];
  const platoonInformation: WarnoPlatoon = {};
  const staticInformation: WarnoStatic = {};

  for (const attribute in unit) {
    if (attribute.startsWith('weaponOne')) {
      weaponOneInformation[attribute.replace('weaponOne_', '')] =
        unit[attribute];
    } else if (attribute.startsWith('weaponTwo')) {
      weaponTwoInformation[attribute.replace('weaponTwo_', '')] =
        unit[attribute];
    } else if (attribute.startsWith('weaponThree')) {
      weaponThreeInformation[attribute.replace('weaponThree_', '')] =
        unit[attribute];
    } else if (platoonStats.includes(attribute)) {
      platoonInformation[attribute] = unit[attribute];
    } else {
      staticInformation[attribute] = unit[attribute];
    }
  }
  return {staticInformation, allWeaponsInformation, platoonInformation};
}