import { Unit } from "../types/unit";
import { getIconForSpecialty, iconMap } from "./get-icon-for-specialty";

export function getIconForUnit(unit: Unit) {
  let icon: string;
  if (unit.category === 'air') {
    icon = 'jet';
  } else if (unit.category === 'hel') {
    icon = 'helicopter';
  } else if (unit.category === 'rec') {
    icon = 'recon';
  } else if (unit.specialities && getIconForSpecialty(unit.specialities[0]) !== undefined) {
    icon = getIconForSpecialty(unit.specialities[0]);
  } else {
    icon = 'support';
  }

  return `waryes:${icon}`;
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

  return `waryes:${icon}`;
}