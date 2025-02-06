import {Division} from '../types/deck-builder';
import {Unit, Weapon} from '../types/unit';
import {isSpecialtyCommand} from '../utils/is-specialty-command';
import {isSpecialtyRecon} from '../utils/is-specialty-recon';
import {FamilyIndexTuple, TerrainResistance} from '../types/damageTable';
import {
  PatchDatabaseAdapter,
  PatchRecord,
} from '../classes/PatchDatabaseAdapter';

export enum BucketFolder {
  WARNO = 'warno',
}

export enum BucketType {
  UNITS_AND_DIVISIONS = 'warno.json',
  DAMAGE_TABLE = 'damageTable.json',
}

export type DamageTable = {
  damageFamilyWithIndexes: FamilyIndexTuple[] | null;
  resistanceFamilyWithIndexes: FamilyIndexTuple[] | null;
  damageTable: number[][] | null;
  terrainResistances:
    | {
        name: string;
        damageFamilies: TerrainResistance[];
      }[]
    | null;
  defaultSuppressDamage: FamilyIndexTuple | null;
  suppressionDamageExceptions:
    | {exception: string; suppression: FamilyIndexTuple}[]
    | null;
  armorToignoreForDamageFamilies: string[] | null;
};

type BundleMap = {
  [BucketFolder.WARNO]: {
    [BucketType.UNITS_AND_DIVISIONS]: {
      units: Unit[] | null;
      divisions: Division[] | null;
      weapons: Weapon[] | null;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BucketType.DAMAGE_TABLE]: DamageTable;
  };
};

// Regex to remove a lot of punctuation found in unit names, helps search methods
export const UNIT_SEARCH_IGNORED_CHARACTERS = /[.,-\/#!$%\^\*\(\)\[\]\{\}]/g;

type UnitDivisionJsonBundle = {
  units: unknown[];
  divisions: unknown[];
};

class BundleManager {
  initialised = false;

  latestPatch?: PatchRecord;

  override = false;

  constructor() {
    this.openOverrideDatabase();
  }
  async openOverrideDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('override', 1);

      request.onerror = () => {
        reject(new Error('Error opening database'));
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('overrides', {keyPath: 'key'});
      };
    });
  }

  async setOverride(key: string, value: unknown) {
    try {
      const db = await this.openOverrideDatabase();
      const transaction = db.transaction('overrides', 'readwrite');
      const store = transaction.objectStore('overrides');

      store.put({key, value});

      transaction.oncomplete = () => {
        console.log('Override set successfully');
      };

      transaction.onerror = (event) => {
        console.error('Error setting override', event);
      };
    } catch (error) {
      console.error('Failed to set override:', error);
    }
  }

  async loadOverride(key: string) {
    const db = await this.openOverrideDatabase();
    const transaction = db.transaction('overrides', 'readonly');
    const store = transaction.objectStore('overrides');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      if (!request) {
        reject(new Error('Error loading override'));
      }

      request.onsuccess = () => {
        try {
          if (!request.result) {
            throw new Error('No override found');
          }
          const jsonResponse = JSON.parse(request?.result?.value);
          resolve(jsonResponse);
        } catch (error) {
          reject(error);
        }
      };

      request.onerror = () => {
        reject(new Error('Error loading override'));
      };
    });
  }

  async clearOverrides() {
    const db = await this.openOverrideDatabase();
    const transaction = db.transaction('overrides', 'readwrite');
    const store = transaction.objectStore('overrides');

    store.clear();
  }

  async initialise() {
    if (this.initialised) {
      return;
    }


    try {
      // if local override exists, use that
      const warnoOverride = await this.loadOverride('warno.json');
      if (warnoOverride) {
        this.initialiseBucket(
          warnoOverride as UnitDivisionJsonBundle,
          BucketFolder.WARNO
        );
        this.override = true;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const damageTableOverride = await this.loadOverride('damageTable.json');

      if (damageTableOverride) {
        this.bundles[BucketFolder.WARNO][BucketType.DAMAGE_TABLE] =
          damageTableOverride as DamageTable;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const latestPatch = await PatchDatabaseAdapter.latest();

      if (!latestPatch) {
        throw new Error('No latest patch found');
      }

      this.latestPatch = latestPatch;

      const latestPatchName = latestPatch.name;

      if (!this.override) {
        const unitDivisions = await this.getBundleFor<UnitDivisionJsonBundle>(
          BucketFolder.WARNO,
          BucketType.UNITS_AND_DIVISIONS,
          latestPatchName
        );

        const damageTable = await this.getBundleFor<DamageTable>(
          BucketFolder.WARNO,
          BucketType.DAMAGE_TABLE,
          latestPatchName
        );

        this.bundles[BucketFolder.WARNO][BucketType.DAMAGE_TABLE] = damageTable;
        // Warno
        this.initialiseBucket(unitDivisions, BucketFolder.WARNO);
      }

      this.initialised = true;
    } catch (err) {
      console.error(err);
    }
  }

  initialiseBucket(
    unitDivisions: UnitDivisionJsonBundle,
    bucketFolder: BucketFolder
  ) {
    const units = unitDivisions.units as Unit[];
    const parsedUnits = [];

    for (const unit of units) {
      const newUnit = this.parseUnit(unit, bucketFolder);
      parsedUnits.push(newUnit);
    }

    this.bundles[bucketFolder][BucketType.UNITS_AND_DIVISIONS].units =
      parsedUnits;

    const divisions = unitDivisions.divisions as Division[];
    const parsedDivisions = [];

    for (const division of divisions) {
      const newDivision = this.parseDivision(division, bucketFolder);
      parsedDivisions.push(newDivision);
    }

    this.bundles[bucketFolder][BucketType.UNITS_AND_DIVISIONS].divisions =
      parsedDivisions;

    const weapons: {
      [key: string]: Weapon;
    } = {};

    for (const unit of parsedUnits as Unit[]) {
      for (const weapon of unit.weapons) {
        if (!weapons[weapon.ammoDescriptorName]) {
          weapons[weapon.ammoDescriptorName] = weapon;
        }
      }
    }

    this.bundles[bucketFolder][BucketType.UNITS_AND_DIVISIONS].weapons =
      Object.values(weapons).sort((a, b) => {
        return a.weaponName.localeCompare(b.weaponName);
      });
  }

  async getDamageTable() {
    await this.initialise();
    return this.bundles[BucketFolder.WARNO][BucketType.DAMAGE_TABLE];
  }

  async getUnits() {
    await this.initialise();
    return [
      ...(this.bundles[BucketFolder.WARNO][BucketType.UNITS_AND_DIVISIONS]
        .units || []),
    ];
  }

  async getUnitsForBucket(folder: BucketFolder) {
    await this.initialise();
    return this.bundles[folder][BucketType.UNITS_AND_DIVISIONS].units;
  }

  async getDivisions() {
    await this.initialise();
    return [
      ...(this.bundles[BucketFolder.WARNO][BucketType.UNITS_AND_DIVISIONS]
        .divisions || []),
    ];
  }

  async getDivisionsForBucket(folder: BucketFolder) {
    await this.initialise();
    return this.bundles[folder][BucketType.UNITS_AND_DIVISIONS].divisions;
  }

  async getWeapons() {
    await this.initialise();
    return [
      ...(this.bundles[BucketFolder.WARNO][BucketType.UNITS_AND_DIVISIONS]
        .weapons || []),
    ];
  }

  async getWeaponsForBucket(folder: BucketFolder) {
    await this.initialise();
    return this.bundles[folder][BucketType.UNITS_AND_DIVISIONS].weapons;
  }

  async getBundleFor<T>(
    _bundleFolder: BucketFolder,
    bundleType: BucketType,
    version: string
  ): Promise<T> {
    return await this.getJsonFromStoragePath<T>(`${version}/${bundleType}`);
  }

  async getJsonFromStoragePath<T>(path: string): Promise<T> {
    const response = await fetch(`${process.env.STATIC_URL}/${path}`);
    const jsonData = await response.json();
    return jsonData;
  }

  normalizeCharacters(text: string): string {
    const charMap: { [key: string]: string } = {
      'Ł': 'L',
      'ł': 'l',
      // Add more mappings as needed
    };

    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").split('').map(char => charMap[char] || char).join('');
  }

  parseUnit(unit: Unit, mod: BucketFolder) {
    const isCommand = isSpecialtyCommand(unit.specialities[0]);
    const isRecon = isSpecialtyRecon(unit.specialities[0]);

    let newDescriptorName = unit.descriptorName;
    let newDivisions = unit.divisions;
    let newWeapons = unit.weapons;

    if (mod !== BucketFolder.WARNO) {
      newDescriptorName = `${newDescriptorName}_${mod}`;
      newDivisions = newDivisions.map((division) => {
        return `${division}_${mod}`;
      });
    }

    newWeapons = newWeapons.map((weapon) => {
      let newAmmoDescriptorName = weapon.ammoDescriptorName;

      if (mod !== BucketFolder.WARNO) {
        newAmmoDescriptorName = `${newAmmoDescriptorName}_${mod}`;
      }
      return {
        ...weapon,
        ammoDescriptorName: newAmmoDescriptorName,
        mod,
      };
    });

    let searchNameHelper = this.normalizeCharacters(unit.name)
    .toLowerCase()
    .replace(UNIT_SEARCH_IGNORED_CHARACTERS, '')

    searchNameHelper = `${unit.name} ${searchNameHelper} ${unit.descriptorName.toLowerCase()}`;

    const newUnit = {
      ...unit,
      descriptorName: newDescriptorName,
      divisions: newDivisions,
      weapons: newWeapons,
      _display: true,
      _searchNameHelper: searchNameHelper,
      mod,
    };

    if (unit.name === '') {
      unit._display = false;
    }

    if (isCommand) {
      unit.name = `(CMD) ${unit.name}`;
    } else if (isRecon) {
      unit.name = `(REC) ${unit.name}`;
    }

    return newUnit;
  }

  parseDivision(division: Division, mod: BucketFolder) {
    const newDivision = {
      ...division,
    };

    if (mod !== BucketFolder.WARNO) {
      newDivision.descriptor = `${newDivision.descriptor}_${mod}`;
      for (const pack of newDivision.packs) {
        pack.packDescriptor = `${pack.packDescriptor}_${mod}`;
        pack.unitDescriptor = `${pack.unitDescriptor}_${mod}`;
        if (pack.availableTransportList) {
          pack.availableTransportList = pack.availableTransportList.map(
            (transport) => {
              return `${transport}_${mod}`;
            }
          );
        }
      }
    }
    return division;
  }

  bundles: BundleMap = {
    [BucketFolder.WARNO]: {
      [BucketType.UNITS_AND_DIVISIONS]: {
        units: null,
        divisions: null,
        weapons: null,
      },
      [BucketType.DAMAGE_TABLE]: {
        damageFamilyWithIndexes: null,
        resistanceFamilyWithIndexes: null,
        damageTable: null,
        terrainResistances: null,
        defaultSuppressDamage: null,
        suppressionDamageExceptions: null,
        armorToignoreForDamageFamilies: null,
      },
    },
  };
}

export const BundleManagerService = new BundleManager();
