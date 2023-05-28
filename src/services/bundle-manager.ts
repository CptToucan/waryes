import {getStorage, ref, getBlob} from 'firebase/storage';
import {Division} from '../types/deck-builder';
import {Unit, Weapon} from '../types/unit';
import {FirebaseService} from './firebase';
import {isSpecialtyCommand} from '../utils/is-specialty-command';
import {isSpecialtyRecon} from '../utils/is-specialty-recon';

export enum BucketFolder {
  WARNO = 'warno',
  FRAGO = 'frago',
  WARNO_LET_LOOSE = 'warno-let-loose',
}

export enum BucketType {
  UNITS_AND_DIVISIONS = 'units-and-divisions.json',
}

type BundleMap = {
  [BucketFolder.WARNO]: {
    [BucketType.UNITS_AND_DIVISIONS]: {
      units: Unit[] | null;
      divisions: Division[] | null;
      weapons: Weapon[] | null;
    };
  };
  [BucketFolder.FRAGO]: {
    [BucketType.UNITS_AND_DIVISIONS]: {
      units: Unit[] | null;
      divisions: Division[] | null;
      weapons: Weapon[] | null;
    };
  };
  [BucketFolder.WARNO_LET_LOOSE]: {
    [BucketType.UNITS_AND_DIVISIONS]: {
      units: Unit[] | null;
      divisions: Division[] | null;
      weapons: Weapon[] | null;
    };
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

  config: {[key in BucketFolder]: boolean} | null = null;

  setConfig(mod: BucketFolder, enabled: boolean): void {
    const currentMods = localStorage.getItem('mods');
    if (currentMods) {
      const mods = JSON.parse(currentMods);
      mods[mod] = enabled;
      localStorage.setItem('mods', JSON.stringify(mods));
    } else {
      const mods = {
        [BucketFolder.WARNO]: true,
        [BucketFolder.FRAGO]: false,
        [BucketFolder.WARNO_LET_LOOSE]: false,
      };
      mods[mod] = enabled;
      localStorage.setItem('mods', JSON.stringify(mods));
    }

    this.config = JSON.parse(localStorage.getItem('mods') || '{}');

    // refresh window

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  public loadConfig() {
    const mods = localStorage.getItem('mods');

    if (mods) {
      this.config = JSON.parse(mods);
    } else {
      this.config = {
        [BucketFolder.WARNO]: true,
        [BucketFolder.FRAGO]: false,
        [BucketFolder.WARNO_LET_LOOSE]: false,
      };

      localStorage.setItem('mods', JSON.stringify(this.config));
    }
  }

  async initialise() {
    if (this.initialised) {
      return;
    }
    this.loadConfig();

    const unitDivisions = await Promise.all([
      this.getBundleFor<UnitDivisionJsonBundle>(
        BucketFolder.WARNO,
        BucketType.UNITS_AND_DIVISIONS
      ),
      this.getBundleFor<UnitDivisionJsonBundle>(
        BucketFolder.FRAGO,
        BucketType.UNITS_AND_DIVISIONS
      ),
      this.getBundleFor<UnitDivisionJsonBundle>(
        BucketFolder.WARNO_LET_LOOSE,
        BucketType.UNITS_AND_DIVISIONS
      ),
    ]);

    // Warno
    this.initialiseBucket(unitDivisions[0], BucketFolder.WARNO);

    if (this.config?.[BucketFolder.FRAGO]) {
      this.initialiseBucket(unitDivisions[1], BucketFolder.FRAGO);
    }

    if (this.config?.[BucketFolder.WARNO_LET_LOOSE]) {
      this.initialiseBucket(unitDivisions[2], BucketFolder.WARNO_LET_LOOSE);
    }

    this.initialised = true;
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

  async getUnits() {
    await this.initialise();
    return [
      ...(this.bundles[BucketFolder.WARNO][BucketType.UNITS_AND_DIVISIONS]
        .units || []),
      ...(this.bundles[BucketFolder.FRAGO][BucketType.UNITS_AND_DIVISIONS]
        .units || []),
      ...(this.bundles[BucketFolder.WARNO_LET_LOOSE][
        BucketType.UNITS_AND_DIVISIONS
      ].units || []),
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
      ...(this.bundles[BucketFolder.FRAGO][BucketType.UNITS_AND_DIVISIONS]
        .divisions || []),
      ...(this.bundles[BucketFolder.WARNO_LET_LOOSE][
        BucketType.UNITS_AND_DIVISIONS
      ].divisions || []),
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
      ...(this.bundles[BucketFolder.FRAGO][BucketType.UNITS_AND_DIVISIONS]
        .weapons || []),
      ...(this.bundles[BucketFolder.WARNO_LET_LOOSE][
        BucketType.UNITS_AND_DIVISIONS
      ].weapons || []),
    ];
  }

  async getWeaponsForBucket(folder: BucketFolder) {
    await this.initialise();
    return this.bundles[folder][BucketType.UNITS_AND_DIVISIONS].weapons;
  }

  async getBundleFor<T>(
    bundleFolder: BucketFolder,
    bundleType: BucketType
  ): Promise<T> {
    const storage = getStorage(FirebaseService.app);
    const jsonBlob = await getBlob(
      ref(storage, `${bundleFolder}/${bundleType}`)
    );
    const jsonBlobStr = await jsonBlob.text();
    const jsonData = JSON.parse(jsonBlobStr);

    return jsonData;
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

    const newUnit = {
      ...unit,
      descriptorName: newDescriptorName,
      divisions: newDivisions,
      weapons: newWeapons,
      _display: true,
      _searchNameHelper: unit.name
        .toLowerCase()
        .replace(UNIT_SEARCH_IGNORED_CHARACTERS, ''),
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
    },
    [BucketFolder.FRAGO]: {
      [BucketType.UNITS_AND_DIVISIONS]: {
        units: null,
        divisions: null,
        weapons: null,
      },
    },
    [BucketFolder.WARNO_LET_LOOSE]: {
      [BucketType.UNITS_AND_DIVISIONS]: {
        units: null,
        divisions: null,
        weapons: null,
      },
    },
  };
}

export const BundleManagerService = new BundleManager();
