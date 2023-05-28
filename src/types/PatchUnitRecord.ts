import { Unit } from "./unit";
import { UnitRecord } from "./UnitRecord";

export class PatchUnitRecord {
  constructor(patch: any, unit: Unit) {
    const unitRecord = new UnitRecord(unit);

    this.patch = patch;
    this.unitRecord = unitRecord;
  } 

  patch: any;
  unitRecord: UnitRecord;
}