interface IconMap {
  [key: string]: string;
}

export const iconMap: IconMap = {
  _amphibie: 'trait-amphibious',
  _reco: 'trait-recon',
  _leader: 'trait-leader',
  _ifv: 'trait-ifv',
  _resolute: 'trait-resolute',
  _para: 'parachute',
  _reservist: 'trait-reservist',
  _choc: 'trait-cqc',
  _sf: 'trait-special-forces',
  _mp: 'trait-mp',
  _gsr: 'trait-gsr',
  _security: 'trait-security',
  _transport1: 'trait-transport',
  _transport2: 'trait-transport',
  hq: 'command',
  hq_veh: 'command',
  hq_inf: 'command',
  hq_tank: 'command',
  reco: 'recon',
  AT: 'at',
  supply: 'supply',
  transport: 'transport',
  infantry: 'infantry',
  ifv: 'ifv',
  engineer: 'assault-infantry',
  mortar: 'mortar',
  howitzer: 'artillery',
  armor: 'tank',
  AA: 'aa',
  sead: 'sead',
};

export function getIconForSpecialty(specialty: string) {
  const icon = iconMap[specialty];
  return icon;
}