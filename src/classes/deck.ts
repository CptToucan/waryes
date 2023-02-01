import {DeckController} from '../controllers/deck-controller';
import {Division, Pack, UnitCategory} from '../types/deck-builder';
import {Unit, UnitMap} from '../types/unit';
import {convertUnitFactoryDescriptorToCategoryDescriptor} from '../utils/convert-unit-factory-descriptor-to-category-descriptor';

export type DeckUnit = {
  veterancy: number;
  transport?: Unit;
  pack: Pack;
};



function parseDescriptorName(descriptor: string): string {
  const splitDescriptor = descriptor.split('/');
  return splitDescriptor[splitDescriptor.length - 1];
}

/*
function findDefaultVeterancy(unitVeterancyQuantityMultipliers: number[]) {
  return unitVeterancyQuantityMultipliers.findIndex(
    (multiplier) => multiplier === 1
  );
}
*/

export type GroupedPacks = {
  [key in UnitCategory]: Pack[];
};

export type GroupedDeckUnitsByDescriptor = {
  [key: string]: DeckUnit[];
};

/**
 * The keys are the group id in descriptor form
 */
export type GroupedDeckUnits = {
  [key in UnitCategory]: DeckUnit[];
};

export type SlotCosts = {
  [key in UnitCategory]: number[];
};

export interface PackMap {
  [key: string]: Pack;
}

export interface DeckPackControllerMap {
  [key: string]: DeckController[];
}

export type DeckCategoryControllerMap = {
  [key in UnitCategory]: DeckController[];
};

export class Deck {
  constructor(division: Division, unitMap: UnitMap) {
    this.division = division;
    this.unitMap = unitMap;

    this._groupedAvailableUnits = this._groupAvailableUnits(
      this.division,
      this.unitMap
    );

    const packMap: PackMap = {};
    for (const pack of this.division.packs) {
      packMap[pack.packDescriptor] = pack;
    }

    this.packMap = packMap;

    const slotCosts: SlotCosts = {
      [UnitCategory.LOG]: [],
      [UnitCategory.REC]: [],
      [UnitCategory.INF]: [],
      [UnitCategory.TNK]: [],
      [UnitCategory.ART]: [],
      [UnitCategory.AA]: [],
      [UnitCategory.HEL]: [],
      [UnitCategory.AIR]: [],
    };

    for (const matrixRow of this.division.costMatrix.matrix) {
      const categoryName = matrixRow.name;
      slotCosts[categoryName] = matrixRow.activationCosts;
    }

    this.slotCosts = slotCosts;
  }

  division: Division;
  unitMap: UnitMap;
  packMap: PackMap;
  slotCosts: SlotCosts;

  hostComponentsForPacks: DeckPackControllerMap = {};
  hostComponentsForCategories: DeckCategoryControllerMap = {    [UnitCategory.LOG]: [],
    [UnitCategory.REC]: [],
    [UnitCategory.INF]: [],
    [UnitCategory.TNK]: [],
    [UnitCategory.ART]: [],
    [UnitCategory.AA]: [],
    [UnitCategory.HEL]: [],
    [UnitCategory.AIR]: [],};

  private _units: DeckUnit[] = [];

  public get units(): DeckUnit[] {
    return this._units;
  }
  public set units(value: DeckUnit[]) {
    this._units = value;
    this._unitsInDeckGroupedUnitsByCategory = this._groupUnitsByCategory(value);
    this._unitInDeckGroupedUnitsByDescriptor =
      this._groupUnitsByDescriptor(value);
  }

  private _unitsInDeckGroupedUnitsByCategory: GroupedDeckUnits = {
    [UnitCategory.LOG]: [],
    [UnitCategory.REC]: [],
    [UnitCategory.INF]: [],
    [UnitCategory.TNK]: [],
    [UnitCategory.ART]: [],
    [UnitCategory.AA]: [],
    [UnitCategory.HEL]: [],
    [UnitCategory.AIR]: [],
  };

  public get unitsInDeckGroupedUnitsByCategory(): GroupedDeckUnits {
    return this._unitsInDeckGroupedUnitsByCategory;
  }

  private _unitInDeckGroupedUnitsByDescriptor: GroupedDeckUnitsByDescriptor =
    {};

  public get unitsInDeckGroupedUnitsByDescriptor(): GroupedDeckUnitsByDescriptor {
    return this._unitInDeckGroupedUnitsByDescriptor;
  }

  private _groupedAvailableUnits: GroupedPacks;

  public get availableUnits(): GroupedPacks {
    return this._groupedAvailableUnits;
  }

  private _groupUnitsByCategory(units: DeckUnit[]): GroupedDeckUnits {
    const groupedUnits: GroupedDeckUnits = {
      [UnitCategory.LOG]: [],
      [UnitCategory.REC]: [],
      [UnitCategory.INF]: [],
      [UnitCategory.TNK]: [],
      [UnitCategory.ART]: [],
      [UnitCategory.AA]: [],
      [UnitCategory.HEL]: [],
      [UnitCategory.AIR]: [],
    };

    for (const deckUnit of units) {
      if (deckUnit) {
        const categoryDescriptor =
          convertUnitFactoryDescriptorToCategoryDescriptor(
            this.getUnitForPack(deckUnit.pack)?.factoryDescriptor || ''
          );

        if (categoryDescriptor !== undefined) {
          groupedUnits[categoryDescriptor].push(deckUnit);
        }
      }
    }

    return groupedUnits;
  }

  private _groupUnitsByDescriptor(
    units: DeckUnit[]
  ): GroupedDeckUnitsByDescriptor {
    const groupedUnits: GroupedDeckUnitsByDescriptor = {};

    for (const deckUnit of units) {
      if (deckUnit) {
        if (groupedUnits[deckUnit.pack.packDescriptor] === undefined) {
          groupedUnits[deckUnit.pack.packDescriptor] = [];
        }

        groupedUnits[deckUnit.pack.packDescriptor].push(deckUnit);
      }
    }

    return groupedUnits;
  }

  private _groupAvailableUnits(
    division: Division,
    unitMap: UnitMap
  ): GroupedPacks {
    const groupedPacks: GroupedPacks = {
      [UnitCategory.LOG]: [],
      [UnitCategory.REC]: [],
      [UnitCategory.INF]: [],
      [UnitCategory.TNK]: [],
      [UnitCategory.ART]: [],
      [UnitCategory.AA]: [],
      [UnitCategory.HEL]: [],
      [UnitCategory.AIR]: [],
    };

    for (const pack of division.packs) {
      const unitDescriptor = parseDescriptorName(pack.unitDescriptor);
      const unit = unitMap[unitDescriptor];

      if (unit?.factoryDescriptor) {
        const categoryDescriptor =
          convertUnitFactoryDescriptorToCategoryDescriptor(
            unit.factoryDescriptor
          );

        if (categoryDescriptor !== undefined) {
          groupedPacks[categoryDescriptor].push(pack);
        }
      }
    }
    return groupedPacks;
  }

  public addUnit(deckUnit: DeckUnit) {
    this.units = [...this._units, deckUnit];
    this.triggerRendersForPack(deckUnit.pack);

    const unit = this.getUnitForPack(deckUnit.pack);
    if(unit) {
      const category = convertUnitFactoryDescriptorToCategoryDescriptor(unit.descriptorName);
      if(category) {
        this.triggerRendersForCategory(category);
      }
    }
  }

  public removeUnit(unit: DeckUnit) {
    const deckWithoutUnit = this.units.filter((_unit) => unit !== _unit);
    this.units = [...deckWithoutUnit];
    this.triggerRendersForPack(unit.pack);
  }

  public get unitCategories(): UnitCategory[] {
    return [
      UnitCategory.LOG,
      UnitCategory.REC,
      UnitCategory.INF,
      UnitCategory.ART,
      UnitCategory.TNK,
      UnitCategory.AA,
      UnitCategory.HEL,
      UnitCategory.AIR,
    ];
  }

  public getUnitForDescriptor(descriptor: string): Unit {
    return this.unitMap?.[descriptor];
  }

  public getUnitForPack(pack: Pack): Unit | undefined {
    const unitDescriptor = pack.unitDescriptor;
    return this.getUnitForDescriptor(unitDescriptor);
  }

  public getTransportsForPack(pack: Pack): Unit[] | undefined {
    if (pack.availableTransportList && pack.availableTransportList.length > 0) {
      return pack.availableTransportList.map((transportDescriptor) =>
        this.getUnitForDescriptor(transportDescriptor)
      );
    }

    return undefined;
  }

  public getDefaultVeterancyForPack(pack: Pack): number {
    return pack.numberOfUnitInPackXPMultiplier.findIndex(
      (multiplier) => multiplier === 1
    );
  }

  public getVeterancyQuantitiesForPack(pack: Pack): number[] {
    const multipliers = pack.numberOfUnitInPackXPMultiplier;
    const quantities: number[] = multipliers.map((quantity) =>
      Math.round(quantity * pack.numberOfUnitsInPack)
    );
    return quantities;
  }

  public getUnitQuantityForPack(pack: Pack, veterancy: number): number {
    const veterancyQuantities = this.getVeterancyQuantitiesForPack(pack);
    const unitCount = veterancyQuantities[veterancy];
    return unitCount;
  }

  public getAvailableQuantityOfPack(pack: Pack): number {
    const numberOfUsedCards =
      this.unitsInDeckGroupedUnitsByDescriptor[pack.packDescriptor]?.length ||
      0;

    const maximumNumberOfCards = pack.numberOfCards;
    const remainingCards = maximumNumberOfCards - numberOfUsedCards;
    return remainingCards;
  }

  public getNextSlotCostForCategory(category: UnitCategory): number {
    const unitsInDeckCategory =
      this.unitsInDeckGroupedUnitsByCategory[category];
    const numberOfUnitsInCategory = unitsInDeckCategory.length;
    const slotCostsForCategory = this.slotCosts[category];
    return slotCostsForCategory[numberOfUnitsInCategory];
  }

  public getTotalSlotsForCategory(category: UnitCategory): number {
    const slotCostsForCategory = this.slotCosts[category];
    return slotCostsForCategory.length;
  }

  public getTotalUnitCountForCategory(category: UnitCategory): number {
    const unitsInDeckCategory =
      this.unitsInDeckGroupedUnitsByCategory[category];
    let unitCount = 0;
    for (const deckUnit of unitsInDeckCategory) {
      unitCount += this.getUnitQuantityForPack(
        deckUnit.pack,
        deckUnit.veterancy
      );
    }

    return unitCount;
  }

  register(host: DeckController, packOrCategory: Pack | UnitCategory) {
    if (isPack(packOrCategory)) {
      const packId = packOrCategory.packDescriptor;
      if (this.hostComponentsForPacks[packId] === undefined) {
        this.hostComponentsForPacks[packId] = [];
      }
      this.hostComponentsForPacks[packId].push(host);
    } else if (isUnitCategory(packOrCategory)) {
      this.hostComponentsForCategories[packOrCategory].push(host);
    }
  }

  unregister(host: DeckController, packOrCategory: Pack | UnitCategory) {
    if (isPack(packOrCategory)) {
      const packId = packOrCategory.packDescriptor;
      if (this.hostComponentsForPacks[packId]) {
        this.hostComponentsForPacks[packId] = this.hostComponentsForPacks[
          packId
        ].filter((_host) => _host !== host);
      }
    } else if (isUnitCategory(packOrCategory)) {
      this.hostComponentsForCategories[packOrCategory] =
        this.hostComponentsForCategories[packOrCategory].filter(
          (_host) => _host !== host
        );
    }
  }

  triggerRendersForPack(pack: Pack) {
    const hostComponentsForPack =
      this.hostComponentsForPacks[pack.packDescriptor];
    for (const controller of hostComponentsForPack) {
      controller.triggerRender();
    }
  }

  triggerRendersForCategory(category: UnitCategory) {
    const hostComponentsForCategory =
      this.hostComponentsForCategories[category];

    for (const controller of hostComponentsForCategory) {
      controller.triggerRender();
    }
  }
}

function isPack(object: unknown): object is Pack {
  return (object as Pack)?.packDescriptor !== undefined;
}

const isSomeEnum =
  <T>(e: T) =>
  (token: unknown): token is T[keyof T] =>
    Object.values(e as never).includes(token as T[keyof T]);

const isUnitCategory = isSomeEnum(UnitCategory);
