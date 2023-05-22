import {getStorage, ref, getBlob} from 'firebase/storage';
import {Division} from '../types/deck-builder';
import {Unit} from '../types/unit';
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
    };
  };
  [BucketFolder.FRAGO]: {
    [BucketType.UNITS_AND_DIVISIONS]: {
      units: Unit[] | null;
      divisions: Division[] | null;
    };
  };
  [BucketFolder.WARNO_LET_LOOSE]: {
    [BucketType.UNITS_AND_DIVISIONS]: {
      units: Unit[] | null;
      divisions: Division[] | null;
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
    this.bundles[BucketFolder.WARNO][BucketType.UNITS_AND_DIVISIONS].units = (
      unitDivisions[0].units as Unit[]
    )
      .map(this.mapUnits)
      .map((unit: Unit) => {
        return {...unit, mod: BucketFolder.WARNO};
      });
    this.bundles[BucketFolder.WARNO][BucketType.UNITS_AND_DIVISIONS].divisions = [];
    //= unitDivisions[0].divisions as Division[];

    // Frago
    if (this.config?.[BucketFolder.FRAGO]) {
      this.bundles[BucketFolder.FRAGO][BucketType.UNITS_AND_DIVISIONS].units = (
        unitDivisions[1].units as Unit[]
      )
        .map(this.mapUnits)
        .map((unit: Unit) => {
          return {
            ...unit,
            descriptorName: `${unit.descriptorName}_frago`,
            mod: BucketFolder.FRAGO,
          };
        });
    }

    this.bundles[BucketFolder.FRAGO][BucketType.UNITS_AND_DIVISIONS].divisions =
      unitDivisions[1].divisions as Division[];

    // Warno Let Loose
    if (this.config?.[BucketFolder.WARNO_LET_LOOSE]) {
      this.bundles[BucketFolder.WARNO_LET_LOOSE][
        BucketType.UNITS_AND_DIVISIONS
      ].units = (unitDivisions[2].units as Unit[])
        .map(this.mapUnits)
        .map((unit: Unit) => {
          return {
            ...unit,
            descriptorName: `${unit.descriptorName}_warno_let_loose`,
            mod: BucketFolder.WARNO_LET_LOOSE,
          };
        });
      this.bundles[BucketFolder.WARNO_LET_LOOSE][
        BucketType.UNITS_AND_DIVISIONS
      ].divisions = [];// unitDivisions[2].divisions as Division[];
    }

    this.initialised = true;
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

  mapUnits(unitData: Unit) {
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
  }

  bundles: BundleMap = {
    [BucketFolder.WARNO]: {
      [BucketType.UNITS_AND_DIVISIONS]: {
        units: null,
        divisions: null,
      },
    },
    [BucketFolder.FRAGO]: {
      [BucketType.UNITS_AND_DIVISIONS]: {
        units: null,
        divisions: null,
      },
    },
    [BucketFolder.WARNO_LET_LOOSE]: {
      [BucketType.UNITS_AND_DIVISIONS]: {
        units: null,
        divisions: null,
      },
    },
  };
}

export const BundleManagerService = new BundleManager();
