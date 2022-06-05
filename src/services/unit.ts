import {WarnoUnit} from '../types';
import {latinize} from '../utils/latinize';
// @ts-ignore
import UnitJson from "../../data/warno-units-v6.json";

class UnitServiceClass {
  private async _fetchData() {
    try {
      const units: WarnoUnit[] = UnitJson.map(function (
        unit: {[key: string]: string},
        index: number
      ) {
        const newUnit: WarnoUnit = {
          id: `${index}`,
          weaponOne: {weaponId: 'weaponOne'},
          weaponTwo: {weaponId: 'weaponTwo'},
          weaponThree: {weaponId: 'weaponThree'},
        } as unknown as WarnoUnit;
  
        for (const prop in unit) {
          // Weapons have the weapon number before the underscore
          const splitProp = prop.split('_');
  
          if (splitProp.length > 1) {
            const weaponName = splitProp[0];
            const weaponProp = splitProp[1];
  
            if (weaponName === 'weaponOne') {
              newUnit.weaponOne[weaponProp] = unit[prop];
            } else if (weaponName === 'weaponTwo') {
              newUnit.weaponTwo[weaponProp] = unit[prop];
            } else if (weaponName === 'weaponThree') {
              newUnit.weaponThree[weaponProp] = unit[prop];
            }
          } else {
            newUnit[prop] = unit[prop];
          }
        }
  
        return newUnit;
      });
  
      return units;
    }
    catch(err) {
      console.error(err);
      return [];
    }
    
  }
  private _units: WarnoUnit[] = [];

  public get units(): WarnoUnit[] {
    return this._units;
  }

  async getUnits(): Promise<WarnoUnit[]> {
    if (this._units.length > 0) {
      return this._units;
    }

    const units = await this._fetchData();
    this._units = units;

    return units;
  }

  getUnit(unitId: string): WarnoUnit | null {
    const units = this.units;
    const unit = units.find((el) => el.id === unitId);
    return unit || null;
  }

  getUnitsById(unitIds: string[]): WarnoUnit[] {
    const allUnits = this.units;
    const foundUnits = allUnits.filter((el) => unitIds.includes(el.id));
    return foundUnits;
  }

  findUnitsByName(searchTerm: string): WarnoUnit[] {
    const parsedSearchTerm = latinize(searchTerm).toLowerCase();
    const units = this.units;
    const foundUnits = units.filter((el) => {
      const latinized = latinize(el.name).toLowerCase();
      const normal = el.name.toLowerCase();

      if (
        latinized.includes(parsedSearchTerm) ||
        normal.includes(parsedSearchTerm)
      ) {
        return true;
      }
      return false;
    });

    return foundUnits;
  }
}

const UnitService = new UnitServiceClass();
export {UnitService};
