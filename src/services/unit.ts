import { WarnoUnit } from "../types";
import { latinize } from "../utils/latinize";

class UnitServiceClass {
  private async _fetchData() {
    const response = await fetch('/warno-units-v3.json');
    const json = await response.json();

    const units: WarnoUnit[] = json.map(function (el: WarnoUnit, index: number) {
      return {
        ...el,
        id: `${index}`,
      };
    });

    return units;
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
    const unit = units.find(el => el.id === unitId);
    return unit || null;
  }

  findUnitsByName(searchTerm: string): WarnoUnit[] {
    const parsedSearchTerm = latinize(searchTerm).toLowerCase();
    const units = this.units;
    const foundUnits = units.filter((el) => {
      const latinized = latinize(el.name).toLowerCase();
      const normal = el.name.toLowerCase();

      if(latinized.includes(parsedSearchTerm) || normal.includes(parsedSearchTerm)) {
        return true;
      }
      return false;
    })

    return foundUnits;
  }
}

const UnitService = new UnitServiceClass();
export {UnitService};
