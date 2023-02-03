import {DeckController} from '../controllers/deck-controller';
import {Division, Pack, UnitCategory} from '../types/deck-builder';
import {Unit, UnitMap} from '../types/unit';
import {convertUnitFactoryDescriptorToCategoryDescriptor} from '../utils/convert-unit-factory-descriptor-to-category-descriptor';
import { Deck as DeckBuilder, /* decodeDeckString ,*/ encodeDeck } from '@izohek/warno-deck-utils';

export interface DeckConstructorOptions  {
  division: Division,
  unitMap: UnitMap,
  deckString?: string
}

export type DeckUnit = {
  veterancy: number;
  transport?: Unit;
  pack: Pack;
};

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

export class Deck {
  constructor(options: DeckConstructorOptions) {
    this.division = options.division;
    this.unitMap = options.unitMap;

    this._groupedAvailableUnits = this._groupAvailableUnits(
      this.division
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

    if(options.deckString) {
      // const _deck: DeckBuilder = decodeDeckString(options.deckString);
      // TODO: For Izohek to convert in to a good way of setting properties
    }
    
  }

  division: Division;
  unitMap: UnitMap;
  packMap: PackMap;
  slotCosts: SlotCosts;

  deckController?: DeckController;

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
    division: Division
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
      const categoryDescriptor = this.getCategoryForPack(pack);

      if (categoryDescriptor !== undefined) {
        groupedPacks[categoryDescriptor].push(pack);
      }
    }
    return groupedPacks;
  }

  public addUnit(deckUnit: DeckUnit) {
   

   const availableQuantityOfPack = this.getAvailableQuantityOfPack(deckUnit.pack);

   if(availableQuantityOfPack === 0) {
    return;
   }

    const unitCategory = this.getCategoryForPack(deckUnit.pack);

    if (unitCategory) {
      const nextSlotCost = this.getNextSlotCostForCategory(unitCategory);


      if(nextSlotCost === undefined) {
        return
      }

      const nextTotalCost = this.usedActivationPoints + nextSlotCost; 

      if(nextTotalCost > this.division.maxActivationPoints) {
        return
      }

      this.units = [...this._units, deckUnit];
      this.deckChanged();
      

    }
  }

  public removeUnit(unit: DeckUnit) {
    const deckWithoutUnit = this.units.filter((_unit) => unit !== _unit);
    this.units = [...deckWithoutUnit];
    this.deckChanged();
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

  public getNextSlotCostForCategory(category: UnitCategory): number | undefined {
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

  public get usedActivationPoints() {
    let totalPoints = 0;
    for(const category  in this.unitsInDeckGroupedUnitsByCategory) {
      const categoryEnum: UnitCategory = category as UnitCategory;
      const slotsCostsForCategory = this.slotCosts[categoryEnum];
      const unitsInDeckCategory = this.unitsInDeckGroupedUnitsByCategory[categoryEnum];
      const numberOfUnitsInDeckCategory = unitsInDeckCategory.length;

      const occupiedSlotCosts = slotsCostsForCategory.slice(0, numberOfUnitsInDeckCategory);
      const slotPointsOccupied = occupiedSlotCosts.reduce((partialSum, a) => partialSum + a, 0);
      totalPoints += slotPointsOccupied;
    }

    return totalPoints;
  }

  public getCategoryForPack(pack: Pack) {
    return convertUnitFactoryDescriptorToCategoryDescriptor(
      this.getUnitForPack(pack)?.factoryDescriptor || ''
    );
  }

  public toDeckCode() {
    const deckBuilder = new DeckBuilder();

    for(const deckUnit of this.units) {
      const unit = this.getUnitForPack(deckUnit.pack);
      if(unit) {
        deckBuilder.addUnitWithId(unit.descriptorName, deckUnit.veterancy, deckUnit.transport?.descriptorName);
      }
      
    }

    const deckString = encodeDeck(deckBuilder);
    return deckString;
  }

  public fromDeckCode(_deckString: string) {
    // const deckBuilder = decodeDeckString(deckString);

    // TODO: for Izohek to import back in to deck structure
  }

  register(host: DeckController) {
    this.deckController = host;
  }

  unregister(_host: DeckController) {
    this.deckController = undefined;
  }

  deckChanged() {
    this.deckController?.triggerRender();
  }
}
