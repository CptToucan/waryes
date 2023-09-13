import { Unit } from "./unit";
import { UnitRecord } from "./UnitRecord";

export class PatchUnitRecord {
  constructor(unitStatPatch: any, allUnitAvailabilityPatch: any,  unit: Unit) {
    const unitRecord = new UnitRecord(unit);

    this.patch = unitStatPatch;
    this.allUnitAvailabilityPatch = allUnitAvailabilityPatch;
    this.unitRecord = unitRecord;
  } 

  patch: any;
  allUnitAvailabilityPatch: any;
  unitRecord: UnitRecord;
}