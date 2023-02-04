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

  if (unit.specialities && iconMap[unit.specialities[0]] !== undefined) {
    icon = iconMap[unit.specialities[0]];
  } else if (unit.category === 'air') {
    icon = 'jet';
  } else {
    icon = 'support';
  }

  return `waryes-svg:${icon}`;
}