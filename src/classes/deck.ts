import {DeckController} from '../controllers/deck-controller';
import {Division, Pack, UnitCategory} from '../types/deck-builder';
import {Unit, UnitMap} from '../types/unit';
import {
  SimpleDeck,
  SimpleUnitCard,
  decodeDeckString,
  encodeDeck,
} from '@izohek/warno-deck-utils';
import {WaryesLookupAdapter} from './WaryesLookupAdapter';

export interface DeckConstructorOptions {
  division: Division;
  unitMap: UnitMap;
}

export interface DeckStringOptions {
  unitMap: UnitMap;
  divisions: Division[];
}

export type DeckUnit = {
  veterancy: number;
  transport?: Unit;
  pack: Pack;
};

export type GroupedPacks = {
  [key in UnitCategory]: Pack[];
};

export type GroupedPacksByCategory = {
  [key in UnitCategory]: GroupedPacksByUnitCategory;
};

export type GroupedPacksByUnitCategory = {
  [key: string]: Pack[];
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

    this._groupedAvailableUnits = this._groupAvailableUnits(this.division);

    const packMap: PackMap = {};
    for (const pack of this.division.packs) {
      packMap[pack.packDescriptor] = pack;
    }

    this.packMap = packMap;

    const slotCosts: SlotCosts = {
      [UnitCategory.LOG]: [],
      [UnitCategory.INF]: [],
      [UnitCategory.ART]: [],
      [UnitCategory.TNK]: [],
      [UnitCategory.REC]: [],
      [UnitCategory.AA]: [],
      [UnitCategory.HEL]: [],
      [UnitCategory.AIR]: [],
      [UnitCategory.DEFENSE]: [],
    };

    for (const matrixRow of this.division.costMatrix.matrix) {
      const categoryName = matrixRow.name;
      slotCosts[categoryName] = matrixRow.activationCosts;
    }

    this.slotCosts = slotCosts;

    const maxAvailabilityOfUnit: {
      [key: string]: number;
    } = {};

    for (const pack of this.division.packs) {
      const unitDescriptor = pack.unitDescriptor;
      const availability = pack.numberOfCards;
      maxAvailabilityOfUnit[unitDescriptor] = availability;
    }

    this._maxAvailabilityOfUnitCard = maxAvailabilityOfUnit;
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
    this._unitsInDeckGroupedUnitsByCategory =
      this._groupUnitsByDeckCategory(value);
    this._unitInDeckGroupedUnitsByPackDescriptor =
      this._groupUnitsByPackDescriptor(value);

    const unitsGroupedUnitsByDescriptor = {} as {
      [key: string]: DeckUnit[];
    };

    for (const unit of this._units) {
      if (!unitsGroupedUnitsByDescriptor[unit.pack.unitDescriptor]) {
        unitsGroupedUnitsByDescriptor[unit.pack.unitDescriptor] = [];
      }

      unitsGroupedUnitsByDescriptor[unit.pack.unitDescriptor].push(unit);
    }

    this._unitsInDeckGroupedByDescriptor = unitsGroupedUnitsByDescriptor;
  }

  private _maxAvailabilityOfUnitCard!: {
    [key: string]: number;
  };

  private _unitsInDeckGroupedUnitsByCategory: GroupedDeckUnits = {
    [UnitCategory.LOG]: [],
    [UnitCategory.REC]: [],
    [UnitCategory.INF]: [],
    [UnitCategory.TNK]: [],
    [UnitCategory.ART]: [],
    [UnitCategory.AA]: [],
    [UnitCategory.HEL]: [],
    [UnitCategory.AIR]: [],
    [UnitCategory.DEFENSE]: [],
  };

  private _unitsInDeckGroupedByDescriptor!: {
    [key: string]: DeckUnit[];
  };

  public get unitsInDeckGroupedUnitsByCategory(): GroupedDeckUnits {
    return this._unitsInDeckGroupedUnitsByCategory;
  }

  private _unitInDeckGroupedUnitsByPackDescriptor: GroupedDeckUnitsByDescriptor =
    {};

  public get unitsInDeckGroupedUnitsByDescriptor(): GroupedDeckUnitsByDescriptor {
    return this._unitInDeckGroupedUnitsByPackDescriptor;
  }

  private _groupedAvailableUnits: GroupedPacksByCategory;

  public get availableUnits(): GroupedPacksByCategory {
    return this._groupedAvailableUnits;
  }

  public get totalSpentActivationPoints(): number {
    let totalActivationPoints = 0;

    for (const _category in this.slotCosts) {
      const category: UnitCategory = _category as UnitCategory;
      const slotCosts = this.slotCosts[category];
      const unitsInDeckCategory =
        this.unitsInDeckGroupedUnitsByCategory[category];

      if (unitsInDeckCategory) {
        const numberOfUnitsInCategory = unitsInDeckCategory.length;

        for (let i = 0; i < numberOfUnitsInCategory; i++) {
          totalActivationPoints += slotCosts[i];
        }
      }
    }

    return totalActivationPoints;
  }

  private _groupUnitsByDeckCategory(units: DeckUnit[]): GroupedDeckUnits {
    const groupedUnits: GroupedDeckUnits = {
      [UnitCategory.LOG]: [],
      [UnitCategory.INF]: [],
      [UnitCategory.ART]: [],
      [UnitCategory.TNK]: [],
      [UnitCategory.REC]: [],
      [UnitCategory.AA]: [],
      [UnitCategory.HEL]: [],
      [UnitCategory.AIR]: [],
      [UnitCategory.DEFENSE]: [],
    };

    for (const deckUnit of units) {
      if (deckUnit) {
        const categoryDescriptor = this.getUnitForPack(deckUnit.pack)
          ?.factoryDescriptor as UnitCategory;

        if (categoryDescriptor !== undefined) {
          groupedUnits[categoryDescriptor].push(deckUnit);
        }
      }
    }

    return groupedUnits;
  }

  private _groupUnitsByPackDescriptor(
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

  /**
   * Groups the available units by the deck category, then by the unit category
   * @param division
   * @returns
   */
  private _groupAvailableUnits(division: Division): GroupedPacksByCategory {
    const groupedPacksByCategoryByUnitCategory: GroupedPacksByCategory = {
      [UnitCategory.LOG]: {},
      [UnitCategory.INF]: {},
      [UnitCategory.ART]: {},
      [UnitCategory.TNK]: {},
      [UnitCategory.REC]: {},
      [UnitCategory.AA]: {},
      [UnitCategory.HEL]: {},
      [UnitCategory.AIR]: {},
      [UnitCategory.DEFENSE]: {},
    };

    for (const pack of division.packs) {
      const categoryDescriptor =
        this.getDeckCategoryForPack(pack) || UnitCategory.LOG;
      const unitSpeciality = this.getSpecialityForPack(pack);

      if (
        groupedPacksByCategoryByUnitCategory[categoryDescriptor][
          unitSpeciality
        ] === undefined
      ) {
        groupedPacksByCategoryByUnitCategory[categoryDescriptor][
          unitSpeciality
        ] = [];
      }

      groupedPacksByCategoryByUnitCategory[categoryDescriptor][
        unitSpeciality
      ].push(pack);
    }

    for (const category in groupedPacksByCategoryByUnitCategory) {
      const group =
        groupedPacksByCategoryByUnitCategory[category as UnitCategory];
      for (const speciality in group) {
        // sort by command points
        group[speciality] = group[speciality].sort((a, b) => {
          const unitA = this.getUnitForPack(a);
          const unitB = this.getUnitForPack(b);
          return (unitA?.commandPoints || 0) - (unitB?.commandPoints || 0);
        });
      }
    }

    return groupedPacksByCategoryByUnitCategory;
  }

  public addUnit(deckUnit: DeckUnit) {
    const availableQuantityOfPack = this.getAvailableQuantityOfPack(
      deckUnit.pack
    );

    if (availableQuantityOfPack === 0) {
      return;
    }

    const unitCategory = this.getDeckCategoryForPack(deckUnit.pack);

    if (unitCategory) {
      const nextSlotCost = this.getNextSlotCostForCategory(unitCategory);

      if (nextSlotCost === undefined) {
        return;
      }

      const nextTotalCost = this.usedActivationPoints + nextSlotCost;

      if (nextTotalCost > this.division.maxActivationPoints) {
        return;
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

  public clearDeck() {
    this.units = [];
    this.deckChanged();
  }

  public get unitCategories(): UnitCategory[] {
    return [
      UnitCategory.LOG,
      UnitCategory.INF,
      UnitCategory.ART,
      UnitCategory.TNK,
      UnitCategory.REC,
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

  public getPackForUnitDescriptor(descriptor: string): Pack | undefined {
    return this.division.packs.find(
      (pack) => pack.unitDescriptor === descriptor
    );
  }

  public getTransportsForPack(pack: Pack): Unit[] | undefined {
    if (pack.availableTransportList && pack.availableTransportList.length > 0) {
      return pack.availableTransportList.map((transportDescriptor) =>
        this.getUnitForDescriptor(transportDescriptor)
      );
    }

    return undefined;
  }

  public getPackAvailableWithoutTransport(pack: Pack): boolean {
    return pack.availableWithoutTransport || false;
  }

  public static getDefaultVeterancyForPack(pack: Pack): number {
    return pack.numberOfUnitInPackXPMultiplier.findIndex(
      (multiplier) => multiplier === 1
    );
  }

  public static getVeterancyQuantitiesForPack(pack: Pack): number[] {
    return Deck.convertMultipliersToQuantities(
      pack.numberOfUnitInPackXPMultiplier,
      pack.numberOfUnitsInPack
    );
  }

  public static convertMultipliersToQuantities(
    multipliers: number[],
    numberOfUnitsInPack: number
  ): number[] {
    const quantities: number[] = multipliers.map((quantity) =>
      Math.round(quantity * numberOfUnitsInPack)
    );
    return quantities;
  }

  public getUnitQuantityForPack(pack: Pack, veterancy: number): number {
    const veterancyQuantities = Deck.getVeterancyQuantitiesForPack(pack);
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

  public getAvailableQuantityOfUnit(unitDescriptor: string): number {
    const numberOfUsedCards =
      this._unitsInDeckGroupedByDescriptor[unitDescriptor]?.length || 0;

    const maximumNumberOfCards =
      this._maxAvailabilityOfUnitCard[unitDescriptor];

    const remainingCards = maximumNumberOfCards - numberOfUsedCards;
    return remainingCards;
  }

  public getNextSlotCostForCategory(
    category: UnitCategory
  ): number | undefined {
    const unitsInDeckCategory =
      this.unitsInDeckGroupedUnitsByCategory[category];
    const numberOfUnitsInCategory = unitsInDeckCategory.length;
    const slotCostsForCategory = this.slotCosts[category];
    return slotCostsForCategory[numberOfUnitsInCategory];
  }

  public getNextSlotCostIndexForCategory(
    category: UnitCategory
  ): number | undefined {
    const unitsInDeckCategory =
      this.unitsInDeckGroupedUnitsByCategory[category];
    const numberOfUnitsInCategory = unitsInDeckCategory.length;

    return numberOfUnitsInCategory;
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

  public getSumOfUnitCostsForCategory(category: UnitCategory): number {
    const unitsInDeckCategory =
      this.unitsInDeckGroupedUnitsByCategory[category];
    let totalCost = 0;

    for (const deckUnit of unitsInDeckCategory) {
      const transportCost = deckUnit.transport?.commandPoints || 0;
      const unitCost = this.getUnitForPack(deckUnit.pack)?.commandPoints || 0;
      const costPerCard = unitCost + transportCost;
      const veterancyQuantities = Deck.getVeterancyQuantitiesForPack(
        deckUnit.pack
      );
      const quantityInCard = veterancyQuantities[deckUnit.veterancy];
      totalCost += costPerCard * quantityInCard;
    }
    return totalCost;
  }

  public getSumOfUnitsCosts() {
    let totalSum = 0;
    for (const category in this.unitsInDeckGroupedUnitsByCategory) {
      const categoryEnum: UnitCategory = category as UnitCategory;
      totalSum += this.getSumOfUnitCostsForCategory(categoryEnum);
    }

    return totalSum;
  }

  public get usedActivationPoints() {
    let totalPoints = 0;
    for (const category in this.unitsInDeckGroupedUnitsByCategory) {
      const categoryEnum: UnitCategory = category as UnitCategory;
      const slotsCostsForCategory = this.slotCosts[categoryEnum];
      const unitsInDeckCategory =
        this.unitsInDeckGroupedUnitsByCategory[categoryEnum];
      const numberOfUnitsInDeckCategory = unitsInDeckCategory.length;

      const occupiedSlotCosts = slotsCostsForCategory.slice(
        0,
        numberOfUnitsInDeckCategory
      );
      const slotPointsOccupied = occupiedSlotCosts.reduce(
        (partialSum, a) => partialSum + a,
        0
      );
      totalPoints += slotPointsOccupied;
    }

    return totalPoints;
  }

  public getDeckCategoryForPack(pack: Pack) {
    return this.getUnitForPack(pack)?.factoryDescriptor as UnitCategory;
  }

  public getSpecialityForPack(pack: Pack) {
    return this.getUnitForPack(pack)?.specialities[0] || '';
  }

  public toDeckCode() {
    const deckBuilder: SimpleDeck = {
      modded: false,
      division: {
        id: this.division.id,
      },
      numberCards: this.units.length,
      cards: this.units
        .map((unit) => {
          const unitCard = this.getUnitForPack(unit.pack);
          return (
            unitCard &&
            ({
              unit: {
                id: unitCard.id,
              },
              veterancy: unit.veterancy,
              transport: unit.transport ? {id: unit.transport?.id} : undefined,
            } as SimpleUnitCard)
          );
        })
        .filter((item) => item !== undefined) as SimpleUnitCard[],
    };

    const deckString = encodeDeck(deckBuilder);
    return deckString;
  }

  /**
   * Create a new Deck object from a deck code
   *
   * @param _deckString
   * @param options
   * @returns
   */
  public static fromDeckCode(_deckString: string, options: DeckStringOptions) {
    const lookupAdapter = new WaryesLookupAdapter(
      options.unitMap,
      options.divisions
    );
    const deckStringDeck = decodeDeckString(_deckString, lookupAdapter);

    const decodedDivision = options.divisions?.find((d) => {
      return d.descriptor == deckStringDeck.division?.descriptor;
    });

    // We must have a division to continue
    if (!decodedDivision) {
      throw new Error('Deck division not set');
    }

    const builtDeck = new Deck({
      unitMap: options.unitMap,
      division: decodedDivision,
    });

    // Convert decoded cards into this objects internal structure
    for (const card of deckStringDeck.cards) {
      if (!card.unit.descriptor) {
        break;
        // throw new Error('Decoded invalid unit card descriptor');
      }
      const pack = builtDeck.division.packs.find((divisionPack) => {
        return divisionPack.unitDescriptor === card.unit.descriptor;
      });

      // NOTE: we currently bail hard if we can't find a unit with the thinking
      // that we would rather error out than have an incomplete deck that does not
      // represent the deck code.
      if (!pack) {
        break;

        /*throw new Error(
          'Decoded pack could not find pack for: ' + card.unit.descriptor
        );
        */
      }

      let transport = undefined;

      try {
        transport = pack.availableTransportList?.find((transport) => {
          return (
            card.transport?.descriptor?.toLowerCase() ===
            transport.toLowerCase()
          );
        });
      } catch (e) {
        console.error(e);
      }

      const transportUnit = transport ? options.unitMap[transport] : undefined;

      // If we have transports then availableWithoutTransport must be set to skip adding a transport
      if (!pack.availableWithoutTransport && !transportUnit) {
        throw new Error('Decoded pack unit must have transport');
      }

      builtDeck.addUnit({
        pack: pack,
        transport: transportUnit,
        veterancy: card.veterancy,
      });
    }

    return builtDeck;
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
