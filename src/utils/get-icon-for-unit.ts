import { Unit } from "../types/unit";

type IconMap = {
  [key: string]: string;
};

const iconMap: IconMap = {
  hq: 'command',
  hq_veh: 'command',
  hq_inf: 'command',
  hq_tank: 'command',
  reco: 'recon',
  AT: 'at',
  supply: 'supply',
  transport: 'transport',
  infantry: 'infantry',
  engineer: 'assault-infantry',
  mortar: 'mortar',
  howitzer: 'artillery',
  armor: 'tank',
  AA: 'aa',
  sead: 'sead',
};

export function getIconForUnit(unit: Unit) {
  let icon: string;
  if (unit.category === 'air') {
    icon = 'jet';
  } else if (unit.category === 'hel') {
    icon = 'helicopter';
  } else if (unit.category === 'rec') {
    icon = 'recon';
  } else if (unit.specialities && iconMap[unit.specialities[0]] !== undefined) {
    icon = iconMap[unit.specialities[0]];
  } else {
    icon = 'support';
  }

  return `waryes-svg:${icon}`;
}

export function getSubIconForUnit(unit: Unit) {
  let icon: string;

  if (unit.category === 'rec') {
    if (unit.fuel == null) {
      icon = iconMap.infantry;
    } else if (unit.roadSpeed == null) {
      icon = 'helicopter';
    } else if (unit.weapons && unit.weapons.length > 0 && (unit.weapons[0].penetration ?? 0) > 11) {
      icon = unit.weapons[0].ammoDescriptorName.toLocaleLowerCase().includes('atgm')
        ? 'at'
        : 'tank';
    } else {
      icon = 'transport';
    }
  } else if (unit.specialities && iconMap[unit.specialities[0]] !== undefined) {
    icon = iconMap[unit.specialities[0]];
  } else {
    icon = 'support';
  }

  return `waryes-svg:${icon}`;
}