import {Unit} from '../types/unit';
import {getIconForUnit} from './get-icon-for-unit';
import {getSubIconForUnit} from './get-icon-for-unit';

interface IconsForUnit {
  icon?: string;
  subIcon?: string;
}

export function getIconsWithFallback(unit: Unit) {

  const icons: IconsForUnit = {};
  icons.icon = getIconForUnit(unit);
  if (
    unit.category === 'air' ||
    unit.category === 'hel' ||
    unit.category === 'rec'
  ) {
    icons.subIcon = getSubIconForUnit(unit);
  }

  return icons
}
