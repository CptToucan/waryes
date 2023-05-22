import {
  Firestore,
} from 'firebase/firestore';
import {FirebaseService, FirebaseServiceClass} from './firebase';
import {getStorage, ref, getBlob} from 'firebase/storage';
import {Unit} from '../types/unit';
import {isSpecialtyCommand} from '../utils/is-specialty-command';
import {isSpecialtyRecon} from '../utils/is-specialty-recon';
import { BundleManagerService } from './bundle-manager';

// Regex to remove a lot of punctuation found in unit names, helps search methods
export const UNIT_SEARCH_IGNORED_CHARACTERS = /[.,-\/#!$%\^\*\(\)\[\]\{\}]/g;

enum UnitFetchStrategy {
  local,
  cache,
  forceDirect,
}

class UnitsDatabaseServiceClass {
  db?: Firestore;
  units?: Unit[];

  isFetching = false;
  hasLoadedBundle = false;
  debug = false;
  _readCounter = 0;

  constructor(service: FirebaseServiceClass) {
    this.db = service.db;
  }

  /**
   * Fetch units from Firebase using a specified strategy.  Use the default cache strategy
   * unless you know what you're doing.
   *
   * @param strategy
   * @returns
   */
  public async fetchUnits() {
    return await BundleManagerService.getUnits();
  }

  async fetchUnitsJson() {
    this.isFetching = true;
    const storage = getStorage(FirebaseService.app);

    if (this.units && this.units?.length > 0) {
      this.isFetching = false;
      return this.units;
    }

    const jsonBlob = await getBlob(
      ref(storage, 'warno/units-and-divisions.json')
    );
    const jsonBlobStr = await jsonBlob.text();
    const jsonData = JSON.parse(jsonBlobStr);

    this.units = jsonData.units.map(function (unitData: Unit) {
      const isCommand = isSpecialtyCommand(unitData.specialities[0]);

      const isRecon = isSpecialtyRecon(unitData.specialities[0]);

      const unit = {
        ...unitData,
        _display: true,
        _searchNameHelper: unitData.name
          .toLowerCase()
          .replace(UNIT_SEARCH_IGNORED_CHARACTERS, ''),
      };

      if (unit.name === '') {
        unit._display = false;
      }

      if (isCommand) {
        unit.name = `(CMD) ${unit.name}`;
      } else if (isRecon) {
        unit.name = `(REC) ${unit.name}`;
      }

      return unit;
    });

    this._readCounter += this.units?.length || 0;
    if (this.debug) {
      console.log('Current Reads: ', this._readCounter);
    }

    this.isFetching = false;
    return this.units;
  }
}

const UnitsDatabaseService = new UnitsDatabaseServiceClass(FirebaseService);
export {UnitsDatabaseService, UnitsDatabaseServiceClass, UnitFetchStrategy};
