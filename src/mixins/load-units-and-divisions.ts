import { BucketFolder, BundleManagerService } from "../services/bundle-manager";
import { DivisionsMap } from "../types/deck-builder";
import { UnitMap } from "../types/unit";


export function LoadUnitsAndDivisionsMixin<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {

    unitMap: UnitMap = {};
    divisionsMap: DivisionsMap = {};

    async fetchUnitMap() {
      const units = await BundleManagerService.getUnitsForBucket(BucketFolder.WARNO);
      const unitMap: UnitMap = {};
  
      if (units) {
        for (const unit of units) {
          unitMap[unit.descriptorName] = unit;
        }
      }
  
      return unitMap;
    }
  
    async fetchDivisionMap() {
      const divisions = await BundleManagerService.getDivisionsForBucket(BucketFolder.WARNO);
      const divisionMap: DivisionsMap = {};
  
      if (divisions) {
        for (const division of divisions) {
          divisionMap[division.descriptor] = division;
        }
      }
  
      return divisionMap;
    }

    async loadUnitsAndDivisions() {
      this.unitMap = await this.fetchUnitMap();
      this.divisionsMap = await this.fetchDivisionMap();
    }
  };
}