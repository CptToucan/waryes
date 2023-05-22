import {Firestore} from 'firebase/firestore';
import {Division} from '../types/deck-builder';
import {FirebaseService, FirebaseServiceClass} from './firebase';
import {Unit} from '../types/unit';
import { BundleManagerService } from './bundle-manager';

class DivisionDatabaseServiceClass {
  db?: Firestore;
  divisions?: Division[];

  isFetching = false;
  hasLoadedBundle = false;
  debug = false;
  _readCounter = 0;

  constructor(service: FirebaseServiceClass) {
    this.db = service.db;
  }

  public async fetchDivisions() {
    return BundleManagerService.getDivisions();
  }

  /**
   * Find the divisions where this unit is available for call-in.
   *
   * 1. Filter divisions where the alliance matches the unit
   * 2. For each remaining division, find a pack where the unit descriptor is present
   *
   * @param unit
   * @returns
   */
  async divisionsForUnit(unit: Unit) {
    const divisions = await this.fetchDivisions();
    const nationalityDivisions = divisions?.filter(
      (division) => division.alliance === unit.unitType.nationality
    );

    return nationalityDivisions?.filter((division) => {
      return division.packs.find(
        (pack) => pack.unitDescriptor === unit.descriptorName
      );
    });
  }
}

const DivisionsDatabaseService = new DivisionDatabaseServiceClass(
  FirebaseService
);
export {DivisionsDatabaseService, DivisionDatabaseServiceClass};
