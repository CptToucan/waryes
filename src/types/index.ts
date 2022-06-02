type WarnoWeapon = {
  [key: string]: string;
}

type WarnoPlatoon = {
  [key: string]: string;
}


interface WarnoUnitType {
  [key: string]: string;
}

type WarnoUnit = WarnoUnitType & {
  id: string
  weaponOne: WarnoWeapon
  weaponTwo: WarnoWeapon
  weaponThree: WarnoWeapon
}

type WarnoStatic = {
  [key: string]: string;
}

export { WarnoWeapon, WarnoPlatoon, WarnoUnit, WarnoStatic };