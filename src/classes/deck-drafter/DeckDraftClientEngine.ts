import { decodeDeckString, encodeDeck, SimpleDeck } from '@izohek/warno-deck-utils';
import {
  BucketFolder,
  BundleManagerService,
} from '../../services/bundle-manager';
import {Division, Pack, UnitCategory} from '../../types/deck-builder';
import {Unit, UnitMap} from '../../types/unit';
import {Deck} from '../deck';
import {WaryesLookupAdapter} from '../WaryesLookupAdapter';
import {DeckDraftEngine} from './DeckDraftEngineInterface';

interface PackChoice {
  unit: string;
  veterancy: number;
  transport: string | null;
}

interface PackConfig {
  pack: string;
  unit: string;
  availableTransports?: string[];
  availableWithoutTransports: boolean;
}

interface DivisionPhaseState {
  phase: 'DIVISION_PICK';
  data: {
    choices: string[];
  };
}

interface UnitPhaseState {
  phase: 'UNIT_PICK';
  data: {
    choices: PackChoice[];
    deckCode: string;
    division: string;
  };
}

interface CompletePhaseState {
  phase: 'COMPLETE';
  data: {
    deckCode: string;
    division: string;
  };
}

export class DeckDraftClientEngine implements DeckDraftEngine {
  units: Unit[] = [];
  divisions: Division[] = [];
  unitMap: UnitMap = {};
  state?: DivisionPhaseState | UnitPhaseState | CompletePhaseState;

  callbacks: Function[] = []; // Array to store registered callbacks

  fireCallbacks(): void {
    this.callbacks.forEach((callback) => {
      callback();
    });
  }

  async initializeDraft(): Promise<void> {
    // fetch the units and divisions

    // create a DIVISON_PICK state

    await this.initializeUnitAndDivisionData();
    const state = this.generateDivisionPickState(this.divisions);
    this.state = state;
    this.setStateToLocalStorage(state);
  }

  public async initializeUnitAndDivisionData() {
    const units = await BundleManagerService.getUnitsForBucket(
      BucketFolder.WARNO
    );
    const divisions = await BundleManagerService.getDivisionsForBucket(
      BucketFolder.WARNO
    );

    if (!units || !divisions) {
      throw new Error('Failed to fetch units and divisions');
    }

    this.units = units;
    this.divisions = divisions;

    const unitMap: UnitMap = {};

    for (const unit of units) {
      unitMap[unit.descriptorName] = unit;
    }

    this.unitMap = unitMap;
  }

  generateDivisionPickState(divisions: Division[]) {
    const deckDraftStateData: DivisionPhaseState = {
      phase: 'DIVISION_PICK',
      data: {
        choices: this.getDivisionChoices(divisions),
      },
    };
    return deckDraftStateData;
  }

  // store state in local storage
  async setStateToLocalStorage(state: unknown) {
    localStorage.setItem('deckDraftState', JSON.stringify(state));
    return;
  }

  async getStateFromLocalStorage() {
    const state = localStorage.getItem('deckDraftState');
    if (!state) {
      throw new Error('No state found in local storage');
    }
    return JSON.parse(state);
  }

  clearStateFromLocalStorage() {
    localStorage.removeItem('deckDraftState');
  }

  async chooseOption(choice: number): Promise<void> {
    if (this.state?.phase === 'DIVISION_PICK') {
      const divisionDescriptor = this.state.data.choices[choice];
      const deckCode = '';
      const nextPhaseData = {
        choices: this.getUnitChoices(
          deckCode,
          this.divisions.find(
            (division) => division.descriptor === divisionDescriptor
          ) as Division,
          this.units,
          this.divisions
        ),
        division: divisionDescriptor,
        deckCode: deckCode,
      };

      this.state = {
        phase: 'UNIT_PICK',
        data: nextPhaseData,
      };

      this.setStateToLocalStorage(this.state);
      return;
    } else if (this.state?.phase === 'UNIT_PICK') {
      const packChoice = this.state.data.choices[choice] as PackChoice;
      const unitDescriptor = packChoice.unit;
      const transportDescriptor = packChoice.transport;
      const veterancy = packChoice.veterancy;
      const deckCode = this.state.data.deckCode;
      const lookupAdapter = new WaryesLookupAdapter(this.unitMap, this.divisions);


      let simpleDeck: SimpleDeck;
      if (deckCode === "") {
        // first pick
        const divisionDescriptor = this.state.data.division;

        simpleDeck = {
          modded: false,
          division: {
            id: this.divisions.find(
              (division: Division) =>
                division.descriptor === divisionDescriptor
            )?.id as number,
          },
          numberCards: 1,
          cards: [
            {
              unit: {
                id:
                  this.getIdForUnit(unitDescriptor, this.units) || 0,
              },
              veterancy: veterancy,
              transport: transportDescriptor
                ? {
                    id:
                      this.getIdForUnit(
                        transportDescriptor,
                        this.units
                      ) || 0,
                  }
                : undefined,
            },
          ],
        };
      } else {
        simpleDeck = decodeDeckString(deckCode, lookupAdapter);

        simpleDeck.cards.push({
          unit: {
            id: this.getIdForUnit(unitDescriptor, this.units) || 0,
          },
          veterancy: veterancy,
          transport: transportDescriptor
            ? {
                id:
                  this.getIdForUnit(
                    transportDescriptor,
                    this.units
                  ) || 0,
              }
            : undefined,
        });

        simpleDeck.numberCards += 1;
      }
          
      const newDeckCode = encodeDeck(simpleDeck);
      
      const nextSessionStateData: UnitPhaseState = {
        phase: "UNIT_PICK",
        data: {
          division: this.state.data.division,
          choices: this.getUnitChoices(
            newDeckCode,
            this.divisions.find(
              (division: Division) =>
                division.descriptor === (this.state as UnitPhaseState).data.division
            ) as Division,
            this.units,
            this.divisions
          ),
          deckCode: newDeckCode,
        },
      };

      this.state = nextSessionStateData;
    }

    return;
  }

  getIdForUnit(unitDescriptor: string, units: Unit[]) {
    const unit = units.find((unit) => unit.descriptorName === unitDescriptor);
    return unit?.id;
  }

  getUnitChoices(
    deckCode: string,
    activeDivision: Division,
    allUnits: Unit[],
    allDivisions: Division[]
  ): PackChoice[] {
    // deck code can = "" if it's the first pick
    // if deck code is not "" then we need to get the division from the deck code
    // if its the first pick present 3 command units from the division

    const isFirstPick = deckCode === '';

    // if its the first pick, present 3 command units from the division
    if (isFirstPick) {
      const commandUnits = this.getCommandUnitPacksForDivision(
        activeDivision,
        allUnits
      );
      return this.generateUnitChoices(commandUnits, activeDivision);
    } else {
      // Account for availability of division slot, you can't add units to a tab if there is no slot / not enough points available.
      // 1. Using the current units in the division work out how many command points are remaining
      // 2. Using the current units in the division work out what slots are still available for selection
      // 3. Using the current units in the division work out which slots are affordable
      // This should then allow us to create a list of units that fulfill the above criteria



      const deck = Deck.fromDeckCode(deckCode, {
        unitMap: this.unitMap,
        divisions: allDivisions,
      });

      const allUnitsMappedByDescriptor: {[key: string]: Unit} = {};

      for (const unit of allUnits) {
        allUnitsMappedByDescriptor[unit.descriptorName] = unit;
      }

      const totalSpentActivationPoints = deck.totalSpentActivationPoints;

      const selectablePackConfigs =
        this.getSelectablePackConfigsInDivision(activeDivision);

      if (totalSpentActivationPoints === deck.division.maxActivationPoints) {
        // 1. No more points available for any category
        return [];
      }

      const categoriesAvailable: UnitCategory[] = [];
      for (const _category in deck.slotCosts) {
        const category = _category as UnitCategory;

        // ignore invalid categories
        if(deck.slotCosts[category].length === 1 && deck.slotCosts[category][0] === 0) {
          continue;
        }

        const nextSlotCost = deck.getNextSlotCostForCategory(category);
        if (nextSlotCost === undefined) {
          // 2. no more slots available
          continue;
        }

        if (
          nextSlotCost + totalSpentActivationPoints >
          deck.division.maxActivationPoints
        ) {
          // 3. not enough points remaining for next slot in category
          continue;
        }

        categoriesAvailable.push(category);
      }

      // Account for availability of unit, you can't add units if there are none left
      // Using the current units in the division work out what units are still available for selection by checking their availability
      // and how many are already in the division
      // if the availability is 0 then remove the unit from the list of units to choose from

      // Using the above two criteria we should now have a list of valid units to add to the division

      // filter selectableUnits by categoriesAvailable

      const packConfigsInAvailableCategories = selectablePackConfigs.filter(
        (packConfig) =>
          categoriesAvailable.includes(
              allUnitsMappedByDescriptor[packConfig.unit].factoryDescriptor as UnitCategory
          )
      );

      const packConfigsWithAvailability =
        packConfigsInAvailableCategories.filter((packConfig) => {
          const unitDescriptor = packConfig.unit;
          const availableQuantity =
            deck.getAvailableQuantityOfUnit(unitDescriptor);
          if (availableQuantity < 1) {
            return false;
          }

          return true;
        });

      if (packConfigsInAvailableCategories.length === 0) {
        return [];
      }

      return this.generateUnitChoices(
        packConfigsWithAvailability,
        activeDivision
      );
    }
  }

  generateUnitChoices(
    originalUnitsToChooseFrom: PackConfig[],
    activeDivision: Division
  ): PackChoice[] {
    const packChoices: PackChoice[] = [];

    let choiceOptions = [...originalUnitsToChooseFrom];
    const unitChoice1 = this.generateChoice(choiceOptions);
    const transportChoice1 = this.chooseTransport(unitChoice1);
    const veterancyChoice1 = this.chooseVeterancy(unitChoice1, activeDivision);

    choiceOptions = choiceOptions.filter(
      (choice) => choice.unit !== unitChoice1.unit
    );

    const unitChoice2 = this.generateChoice(choiceOptions);
    const transportChoice2 = this.chooseTransport(unitChoice2);
    const veterancyChoice2 = this.chooseVeterancy(unitChoice2, activeDivision);

    choiceOptions = choiceOptions.filter(
      (choice) => choice.unit !== unitChoice2.unit
    );

    const unitChoice3 = this.generateChoice(choiceOptions);
    const transportChoice3 = this.chooseTransport(unitChoice3);
    const veterancyChoice3 = this.chooseVeterancy(unitChoice3, activeDivision);

    packChoices.push({
      unit: unitChoice1.unit,
      transport: transportChoice1,
      veterancy: veterancyChoice1,
    });

    packChoices.push({
      unit: unitChoice2.unit,
      transport: transportChoice2,
      veterancy: veterancyChoice2,
    });

    packChoices.push({
      unit: unitChoice3.unit,
      transport: transportChoice3,
      veterancy: veterancyChoice3,
    });

    return packChoices;
  }

  chooseTransport(packConfig: PackConfig) {
    let transportChoice1 = null;

    let options: (string | null)[] = packConfig.availableTransports || [];

    if(packConfig.availableWithoutTransports) {
      options.push(null)
    }
    
    if (
      packConfig?.availableTransports &&
      packConfig?.availableTransports?.length > 0
    ) {
      transportChoice1 = this.generateChoice(options);
    }
    return transportChoice1;
  }

  chooseVeterancy(packConfig: PackConfig, division: Division): number {
    const pack: Pack = division.packs.find(
      (pack) => pack.packDescriptor === packConfig.pack
    ) as Pack;
    // choose a multiplier that is not less than equal to 0

    // remove 0s from the veterancy multiplier list and store their indexes

    const multipliersWithIndex = pack.numberOfUnitInPackXPMultiplier.map(
      (multiplier, index) => {
        return {
          multiplier,
          index,
        };
      }
    );

    const nonZeroMultipliersWithIndex = multipliersWithIndex.filter(
      (multiplierWithIndex) => multiplierWithIndex.multiplier > 0
    );
    const vetPick = this.generateChoice<{multiplier: number; index: number}>(
      nonZeroMultipliersWithIndex
    );
    return vetPick.index;
  }

  async completeDraft(): Promise<string> {
    const deckCode = (this.state as UnitPhaseState).data.deckCode;

    const nextSessionStateData: CompletePhaseState = {
      phase: "COMPLETE",
      data: {
        deckCode: deckCode,
        division: (this.state as UnitPhaseState).data.division,
      },
    };

    this.state = nextSessionStateData;
    this.clearStateFromLocalStorage();
    return deckCode;
  }

  getCommandUnitPacksForDivision(division: Division, allUnits: Unit[]) {
    const packConfigs = this.getSelectablePackConfigsInDivision(division);

    const units = packConfigs.map((unitAndPackDescriptor) => {
      return allUnits.find(
        (unit) => unit.descriptorName === unitAndPackDescriptor.unit
      );
    }) as Unit[];

    const commandUnits = units.filter((unit) => unit.isCommand);

    const commandUnitAndPackDescriptorsInDivision = packConfigs.filter(
      (unitAndPackDescriptor) => {
        return commandUnits.find(
          (unit) => unit.descriptorName === unitAndPackDescriptor.unit
        );
      }
    );

    return commandUnitAndPackDescriptorsInDivision;
  }

  getSelectablePackConfigsInDivision(division: Division): PackConfig[] {
    return division.packs.map((pack) => {
      return {
        unit: pack.unitDescriptor,
        pack: pack.packDescriptor,
        availableTransports: pack.availableTransportList,
        availableWithoutTransports: pack.availableWithoutTransport
      };
    });
  }

  generateChoice<T>(thingsToChooseFrom: T[]): T {
    const randomIndex = Math.floor(Math.random() * thingsToChooseFrom.length);
    const randomThing = thingsToChooseFrom[randomIndex];
    return randomThing;
  }

  getDivisionChoices(divisions: Division[]) {
    const divisionDescriptors = divisions.map((division) => {
      return division.descriptor;
    });

    return this.generateDivisionChoices(divisionDescriptors);
  }

  generateDivisionChoices(thingsToChooseFrom: string[]) {
    const choices: string[] = [];

    // pick 1 random thing to choose from
    const firstChoice = this.generateChoice(thingsToChooseFrom);
    choices.push(firstChoice);
    // remove choice from things to choose from
    const remainingThingsToChooseFrom = thingsToChooseFrom.filter(
      (thing) => thing !== firstChoice
    );

    if (remainingThingsToChooseFrom.length === 0) {
      return choices;
    }

    // pick 1 random thing to choose from
    const secondChoice = this.generateChoice(remainingThingsToChooseFrom);
    choices.push(secondChoice);
    // remove choice from things to choose from
    const remainingThingsToChooseFrom2 = remainingThingsToChooseFrom.filter(
      (thing) => thing !== secondChoice
    );

    if (remainingThingsToChooseFrom2.length === 0) {
      return choices;
    }
    // pick 1 random thing to choose from
    const thirdChoice = this.generateChoice(remainingThingsToChooseFrom2);
    choices.push(thirdChoice);

    return choices;
  }
}
