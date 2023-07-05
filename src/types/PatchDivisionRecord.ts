import { Division } from "./deck-builder";

export class PatchDivisionRecord {
  constructor(patch: any, division: Division) {
    this.patch = patch;
    this.divisionRecord = division;
  } 

  patch: any;
  divisionRecord: Division;
}