import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import './armoury-card';
import './pack-armoury-card';
import './deck-card';
import '@vaadin/scroller';
import {Division, MatrixRow, Pack} from '../../types/deck-builder';
import {Unit, UnitMap} from '../../types/unit';
import {getQuantitiesForUnitVeterancies} from '../../utils/get-quantities-for-unit-veterancies';
// import { UnitCardCategories } from '@izohek/warno-deck-utils';
import 'side-drawer';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';
import {deckCategoryIsDeprecated} from '../../utils/deck-category-is-deprecated';

type GroupedPacks = {
  [key: string]: Pack[];
};

type GroupedPackConfigs = {
  [key: string]: SelectedPackConfig[];
};

type FactoryDescriptorMap = {
  [key: string]: string;
};

export interface SelectedPackConfig {
  id: number;
  unit: Unit;
  veterancy: number;
  transport?: Unit;
  pack: Pack;
}

const factoryDescriptorMap: FactoryDescriptorMap = {
  'EDefaultFactories/Helis': 'EDefaultFactories/Helis',
  'EDefaultFactories/Logistic': 'EDefaultFactories/Logistic',
  'EDefaultFactories/Planes': 'EDefaultFactories/air',
  'EDefaultFactories/Support': 'EDefaultFactories/support',
  'EDefaultFactories/AT': 'EDefaultFactories/at',
  'EDefaultFactories/Infantry': 'EDefaultFactories/infanterie',
  'EDefaultFactories/Recons': 'EDefaultFactories/reco',
  'EDefaultFactories/Tanks': 'EDefaultFactories/tank',
};

/**
 *       .deck {
        grid-area: deck;
        border-right: 1px solid var(--lumo-contrast-10pct);
        padding: var(--lumo-space-s);
        height: 100%;
        overflow: auto;
      }
 */

@customElement('edit-deck')
export class EditDeck extends LitElement {
  static get styles() {
    return css`
      .card-section h3 {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-contrast-90pct);
      }

      .filters {
        grid-area: filters;
        border-left: 1px solid var(--lumo-contrast-10pct);
        padding: var(--lumo-space-s);
      }

      .deck-category-cards {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
      }

      .deck-category-headings {
        display: flex;
        flex-direction: column;
      }

      .deck-category-heading-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        color: var(--lumo-contrast-80pct);
      }

      .deck-category-cards > deck-card {
        margin-top: var(--lumo-space-xs);
      }

      .armoury-category-cards {
        display: grid;
        padding: var(--lumo-space-s);
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));

        gap: var(--lumo-space-xs);
      }

      h3 {
        margin: 0;
      }

      h3.deck-title {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .deck-category-heading-title {
        color: var(--lumo-primary-color-50pct);
        text-transform: uppercase;
      }

      side-drawer {
        background-color: var(--lumo-base-color);
        max-width: 95vw;
      }

      side-drawer > .deck {
        height: 100%;
        overflow: auto;
      }

      :host {
        display: flex;
        flex: 0 0 100%;
        height: 100%;
      }
      .container {
        flex: 1 1 0;
        max-height: 100%;
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);

        overflow: hidden;
      }

      .cards {
        height: 100%;
        overflow: auto;
        position: relative;
      }

      .deck {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      .desktop {
        display: flex;
        flex-direction: row;
        height: 100%;
      }

      .desktop > .cards {
        flex: 1 1 80%;
      }

      .desktop > .deck {
        flex: 1 0 20%;
        height: 100%;
        overflow-y: auto;
        min-width: 300px;
        border-right: 1px solid var(--lumo-contrast-20pct);
      }

      .button-drawer {
        position: fixed;
        bottom: 0;
        height: 60px;
        width: 100%;
        background-color: var(--lumo-base-color);
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--lumo-contrast-20pct);
      }

      .button-drawer > vaadin-button {
        flex: 1 1 100%;
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
      }

      @media only screen and (min-width: 701px) {
        .button-drawer {
          display: none
        }
      }

      @media only screen and (max-width: 700px) {
        .desktop > .deck {
          display: none;
        }

 
      }
    `;
  }

  @state()
  deckOpen = false;

  /**
   * Division that is being edited
   */
  @property()
  division?: Division;

  /**
   * Contains map of all units, rather than having to search through an array
   */
  @property()
  unitMap?: UnitMap;

  /**
   * Tracks the last ID used in the pack config, so a unique index is always used
   */
  _lastPackId = 0;

  @state()
  builtDeck: SelectedPackConfig[] = [];

  /**
   * Convert descriptor from bad format to good format. Probably not needed anymore now that the descriptors have the ~ removed
   * @param descriptor
   */
  parseDescriptorName(descriptor: string): string {
    const splitDescriptor = descriptor.split('/');
    return splitDescriptor[splitDescriptor.length - 1];
  }

  /**
   * When a pack is fully selected from the pack-armoury-card this even is fired
   * Triggers adding packs to the deck structure
   * @param event
   */
  packConfigSelected(event: CustomEvent) {
    const packConfig: SelectedPackConfig = {
      id: this._lastPackId++,
      unit: event.detail.unit,
      veterancy: event.detail.veterancy,
      transport: event.detail.transport,
      pack: event.detail.pack,
    };
    this.addPackToDeck(packConfig);
  }

  packConfigRemoved(event: CustomEvent) {
    const packConfig: SelectedPackConfig = event.detail.packConfig;
    this.removePackFromDeck(packConfig);
  }

  /**
   * Adds pack to the deck config
   * @param packConfig
   */
  addPackToDeck(packConfig: SelectedPackConfig) {
    this.builtDeck = [...this.builtDeck, packConfig];
  }

  /**
   * Removes pack from the deck config
   * @param packConfig
   */
  removePackFromDeck(packConfig: SelectedPackConfig) {
    const deckWithoutPack = this.builtDeck.filter(
      (config) => packConfig.id !== config.id
    );
    this.builtDeck = [...deckWithoutPack];
  }

  /**
   * Render the content of the side drawer
   * @param groupedDeck
   */
  renderDeck(groupedDeck: GroupedPackConfigs): TemplateResult[] {
    const renderOutput: TemplateResult[] = [];
    if (this.division?.costMatrix?.matrix) {
      for (const matrixRow of this.division?.costMatrix?.matrix) {
        if (!deckCategoryIsDeprecated(matrixRow.name)) {
          renderOutput.push(
            this.renderDeckCategory(matrixRow, groupedDeck[matrixRow.name])
          );
        }
      }
    }

    return renderOutput;
  }

  /**
   * Render a section of the deck category, renders all selected deck cards
   * @param matrixRow
   * @param groupedUnits
   * @param division
   */
  renderDeckCategory(
    matrixRow: MatrixRow,
    groupedUnits: SelectedPackConfig[]
  ): TemplateResult {
    let totalUnitsInCategory = 0;

    const deckCards: TemplateResult[] = [];
    for (const config of groupedUnits) {
      const veterancies = getQuantitiesForUnitVeterancies({
        defaultUnitQuantity: config.pack.numberOfUnitsInPack,
        unitQuantityMultipliers: config.pack.numberOfUnitInPackXPMultiplier,
      });

      totalUnitsInCategory += veterancies[config.veterancy];

      deckCards.push(
        html`<deck-card
          .packConfig=${config}
          @pack-config-removed=${this.packConfigRemoved}
          .unitMap=${this.unitMap}
        ></deck-card>`
      );
    }
    return html`<div class="deck-section">
      <div class="deck-category-headings">
        <div class="deck-category-heading-row">
          <h3 class="deck-category-heading-title">
            ${getCodeForFactoryDescriptor(matrixRow.name)}
          </h3>
          <div>${totalUnitsInCategory} units</div>
        </div>
        <div class="deck-category-heading-row">
          <div>
            ${groupedUnits.length} / ${matrixRow.activationCosts.length} slots
          </div>
          <div>
            Next slot: ${matrixRow.activationCosts[groupedUnits.length]} points
          </div>
        </div>
      </div>
      <div class="deck-category-cards">${deckCards}</div>
    </div>`;
  }

  /**
   * Render the groups of the armoury card categories
   * @param groupedUnits
   */
  renderCardCategories(groupedUnits: GroupedPacks) {
    const renderOutput: TemplateResult[] = [];

    if (this.division?.costMatrix?.matrix) {
      for (const matrixRow of this.division?.costMatrix?.matrix) {
        if (!deckCategoryIsDeprecated(matrixRow.name)) {
          renderOutput.push(
            this.renderCardCategory(
              getCodeForFactoryDescriptor(matrixRow.name) || '',
              groupedUnits[matrixRow.name]
            )
          );
        }
      }
    }

    return renderOutput;
  }

  /**
   * Render a specific deck category
   * @param name
   * @param packs
   */
  renderCardCategory(name: string, packs: Pack[]): TemplateResult {
    return html`<div class="card-section">
      <div><h3>${name}</h3></div>

      <div class="armoury-category-cards">
        ${packs.map((pack) => {
          /**
           * TODO: Check a data structure instead, this is potentially an expensive operation if being done every render
           */
          const currentQuantitySelectedOfThisPack = this.builtDeck.filter(
            (packConfig) =>
              packConfig.pack.packDescriptor === pack.packDescriptor
          ).length;

          const remaining =
            pack.numberOfCards - currentQuantitySelectedOfThisPack;
          let disabled = false;
          if (currentQuantitySelectedOfThisPack >= pack.numberOfCards) {
            disabled = true;
          }
          return html`<pack-armoury-card
            .pack=${pack}
            .unitMap=${this.unitMap}
            @pack-selected=${this.packConfigSelected}
            .disabled=${disabled}
            .remaining=${remaining}
          ></pack-armoury-card>`;
        })}
      </div>
    </div>`;
  }

  render(): TemplateResult {
    const groupedArmouryUnits: GroupedPacks = {};
    const groupedDeckUnits: GroupedPackConfigs = {};

    if (this.division?.costMatrix?.matrix) {
      for (const category of this.division?.costMatrix?.matrix) {
        groupedArmouryUnits[category.name] = [];
        groupedDeckUnits[category.name] = [];
      }
    }

    groupedArmouryUnits['NOT_DEFINED'] = [];
    groupedDeckUnits['NOT_DEFINED'] = [];

    if (this?.division?.packs) {
      for (const pack of this.division.packs) {
        const unitDescriptor = this.parseDescriptorName(pack.unitDescriptor);
        const unit = this.unitMap?.[unitDescriptor];
        if (unit && unit.factoryDescriptor) {
          const parsedFactoryDescriptor =
            factoryDescriptorMap[unit.factoryDescriptor];
          if (parsedFactoryDescriptor !== undefined) {
            groupedArmouryUnits[parsedFactoryDescriptor].push(pack);
          } else {
            groupedArmouryUnits['NOT_DEFINED'].push(pack);
          }
        }
      }
    }

    for (const packConfig of this.builtDeck) {
      const parsedFactoryDescriptor =
        factoryDescriptorMap[packConfig.unit.factoryDescriptor];

      if (parsedFactoryDescriptor !== undefined) {
        groupedDeckUnits[parsedFactoryDescriptor].push(packConfig);
      } else {
        groupedDeckUnits['NOT_DEFINED'].push(packConfig);
      }
    }

    return html`
      <div class="container">
        <side-drawer
          .open=${this.deckOpen}
          @close=${() => (this.deckOpen = false)}
          @open=${() => (this.deckOpen = true)}
        >
          <div class="deck">
            <h3 class="deck-title">${this.division?.descriptor}</h3>
            ${this.renderDeck(groupedDeckUnits)}
          </div>
        </side-drawer>
        <div class="desktop">
          <div class="deck">
            <h3 class="deck-title">${this.division?.descriptor}</h3>
            ${this.renderDeck(groupedDeckUnits)}
          </div>

          <div class="cards">
            <div class="button-drawer">
              <vaadin-button @click=${() => (this.deckOpen = !this.deckOpen)} theme="large"
                >Deck</vaadin-button
              >
              <vaadin-button @click=${() => (this.deckOpen = !this.deckOpen)} theme="large"
                >Filters</vaadin-button
              >
            </div>

            ${this.renderCardCategories(groupedArmouryUnits)}
            <div style="height: 60px;"></div>
          </div>
        </div>
      </div>
    `;
  }
}
