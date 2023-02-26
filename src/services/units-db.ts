import {
  collection,
  getDocs,
  getDocsFromCache,
  Firestore,
  loadBundle,
  namedQuery,
} from 'firebase/firestore';
import {FirebaseService, FirebaseServiceClass} from './firebase';
import {getStorage, ref, getBlob} from 'firebase/storage';
import {Unit} from '../types/unit';
import { isSpecialtyCommand } from '../utils/is-specialty-command';
import { isSpecialtyRecon } from '../utils/is-specialty-recon';

const CURRENT_FILE_NAME = 'bundle-units.txt';
const CURRENT_NAMED_QUERY = 'units';

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
  public async fetchUnits(
    strategy: UnitFetchStrategy = UnitFetchStrategy.cache
  ) {
    switch (strategy) {
      case UnitFetchStrategy.cache:
        if (this.debug) {
          console.log('Loading units from cache');
        }
        return await this.fetchUnitsCache();
      case UnitFetchStrategy.forceDirect:
        if (this.debug) {
          console.log('Loading units from cloud');
        }
        return await this.fetchUnitsForceDirect();
    }

    return [];
  }

  /**
   * Fetch units by loading a bundle file from firebase storage.  This will incur a storage
   * read if it is not already cached, but will otherwise not require any requests made to the
   * firestore database.
   *
   * @returns
   */
  async fetchUnitsCache() {
    if (this.units) {
      if (this.debug) {
        console.log('Cache loading from cache cache');
      }
      return this.units;
    }
    this.isFetching = true;
    // Create a reference with an initial file path and name
    const storage = getStorage(FirebaseService.app);
    const pathReference = ref(storage, CURRENT_FILE_NAME);
    const bundleBlob = await getBlob(pathReference);
    const bundleBlobStr = await bundleBlob.text();

    if (this.db) {
      if (!this.hasLoadedBundle) {
        await loadBundle(this.db, bundleBlobStr);
        this.hasLoadedBundle = true;
      }
    } else {
      this.isFetching = false;
      throw new Error('Error loading bundle file');
    }

    const query = await namedQuery(this.db, CURRENT_NAMED_QUERY);
    if (!query) throw new Error('Failed to find named query');

    const unitsQuery = await getDocsFromCache(query);

    this.units = unitsQuery.docs.map(function (doc) {
      const unitData = doc.data() as Unit;

      const isCommand = isSpecialtyCommand(unitData.specialities[0]);

      const isRecon = isSpecialtyRecon(unitData.specialities[0]);

      const unit = {
        ...unitData,
        _display: true,
        _searchNameHelper: unitData.name
          .toLowerCase()
          .replace(UNIT_SEARCH_IGNORED_CHARACTERS, ''),
      };

      if(unit.name === "") {
        unit._display = false; 
      }
      
      if(isCommand) {
        unit.name = `(CMD) ${unit.name}`
      }
      else if (isRecon) {
        unit.name = `(REC) ${unit.name}`
      }
      

      return unit;
    });

    this._readCounter += this.units.length;
    if (this.debug) {
      console.log('Current Reads: ', this._readCounter);
    }

    this.isFetching = false;
    return this.units;
  }

  /**
   * Fetch units by querying firebase directly.  This will cause a number of firebase
   * requests equal to the number of units in the database.
   *
   * @param force
   * @returns
   */
  async fetchUnitsForceDirect(force: Boolean = false) {
    if (this.isFetching) return this.units ?? [];
    if (this.debug) {
      console.log('Fetch');
    }
    // Cache first
    if (this.units && !force) return this.units ?? [];
    if (this.debug) {
      console.log('No cache');
    }
    // Setup and attempt to fetch
    if (!this.db) return null;

    this.isFetching = true;
    const unitsQuery = await getDocs(collection(this.db, 'units'));
    this.units = unitsQuery.docs.map(function (doc) {
      return doc.data() as Unit;
    });

    this._readCounter += this.units.length;
    if (this.debug) {
      console.log('Current Reads: ', this._readCounter);
    }

    this.isFetching = false;
    return this.units;
  }
}

const UnitsDatabaseService = new UnitsDatabaseServiceClass(FirebaseService);
export {UnitsDatabaseService, UnitsDatabaseServiceClass, UnitFetchStrategy};
