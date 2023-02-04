import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/deck/edit-deck';
import '@vaadin/scroller';
import {UnitsDatabaseService} from '../services/units-db';
import {BeforeEnterObserver} from '@vaadin/router';
// import { decodeDeckString, Deck } from '@izohek/warno-deck-utils';

// @ts-ignore
import DeckBuilderJson from '../../data/deckbuilder-data-test.json';
import {Division, DivisionsMap} from '../types/deck-builder';
import {UnitMap} from '../types/unit';
import {Deck} from '../classes/deck';
import {DivisionsDatabaseService} from '../services/divisions-db';
import '../components/country-flag';

@customElement('deck-builder-route')
export class DeckBuilderRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      h3 {
        margin: 0;
      }

      vaadin-button {
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
      }

      button {
        all: unset;
        cursor: pointer;
      }

      .division-selection {
        display: flex;
        flex-direction: column;
      }

      button.division-selector {
        border-radius: var(--lumo-border-radius-m);
        padding: var(--lumo-space-m);
        background-color: var(--lumo-contrast-5pct);
        margin-bottom: var(--lumo-space-s);
        display: flex;
        align-items: center;
        color: var(--lumo-contrast-80pct);
      }

      button.division-selector:hover {
        background-color: var(--lumo-contrast-10pct);
      }

      .button-content {
        flex: 1 1 100%;
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
        justify-content: space-between;
      }

      .button-content > span {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      country-flag {
        margin-right: var(--lumo-space-s);
      }
    `;
  }

  unitMap?: UnitMap;
  divisionsMap?: DivisionsMap;

  constructor() {
    super();
    // console.log(divisionData);
    // console.log(decodeDeckString("FBF8aMS0fYAEfYANEgAGMQAKL4AKO0RFkBBsq5BkeIAEgoAKNQ/WNRBkq0Vkq0VktZ82NsRKU0RKT4AKKsVFtYAGLwAGOsVFOwAMfgAGI0RErERGPIAGPgAGMoAGPQAFrx80gcREgcRKT4AGNEVAgA=="))
  }

  /**
   * Converts unit array in to a map to be used by the edit-deck component
   */
  async onBeforeEnter() {
    this.unitMap = await this.fetchUnitMap();

    const [units, divisions] = await Promise.all([
      this.fetchUnitMap(),
      this.fetchDivisionMap(),
    ]);

    this.unitMap = units;
    this.divisionsMap = divisions;

    this.availableDivisions = Object.values(this.divisionsMap).sort(
      alphabeticalCompare
    );

    console.log(this.availableDivisions);

    // TODO: this is hard coded for testing, remove to show division list to start a new deck instead
    // let deckString = "FBF8aMS0fYAEfYANEgAGMQAKL4AKO0RFkBBsq5BkeIAEgoAKNQ/WNRBkq0Vkq0VktZ82NsRKU0RKT4AKKsVFtYAGLwAGOsVFOwAMfgAGI0RErERGPIAGPgAGMoAGPQAFrx80gcREgcRKT4AGNEVAgA==";
    /*
    let deckFromString = Deck.fromDeckCode(deckString, {
      unitMap: units,
      divisions: this.availableDivisions
    });

    this.selectedDivision = deckFromString.division
    this.deckToEdit = deckFromString
    */
    // end-todo
  }

  async fetchUnitMap() {
    const units = await UnitsDatabaseService.fetchUnits();
    const unitMap: UnitMap = {};

    if (units) {
      for (const unit of units) {
        unitMap[unit.descriptorName] = unit;
      }
    }

    return unitMap;
  }

  async fetchDivisionMap() {
    const divisions = await DivisionsDatabaseService.fetchDivisions();
    const divisionMap: DivisionsMap = {};

    if (divisions) {
      for (const division of divisions) {
        divisionMap[division.descriptor] = division;
      }
    }

    return divisionMap;
  }

  /**
   * Currently selected division
   */
  @state()
  selectedDivision?: Division;

  /**
   * Available divisions for selections
   */
  availableDivisions: Division[] = [];

  @state()
  deckToEdit?: Deck;

  selectDivision(division: Division) {
    if (this.unitMap) {
      this.deckToEdit = new Deck({division, unitMap: this.unitMap});
    } else {
      throw new Error('Unit Map not loaded');
    }
  }

  render(): TemplateResult {
    if (this.deckToEdit) {
      return this.renderDeckEditor(this.deckToEdit);
    }
    return this.renderDivisionSelection();
  }

  renderDeckEditor(deck: Deck): TemplateResult {
    return html`<edit-deck .deck=${deck}></edit-deck>`;
  }

  renderDivisionSelection(): TemplateResult {
    return html`<div class="division-selection">
      <h3>Import a deck</h3>
      <vaadin-text-field
        label="Deck Code"
        clear-button-visible
      >
        <vaadin-icon slot="prefix" icon="vaadin:code"></vaadin-icon>
      </vaadin-text-field>
      <h3>Select a deck to edit</h3>
      ${this.availableDivisions.map((div) => {
        console.log(div);
        return html`<button
          class="division-selector"
          @click=${() => this.selectDivision(div)}
        >
          <country-flag .country=${div.country}></country-flag>
          <span>${div.descriptor}</span>
        </button>`;
      })}
    </div>`;
  }
}

function alphabeticalCompare(a: Division, b: Division) {
  if (a.alliance < b.alliance) {
    return -1;
  }
  if (a.alliance > b.alliance) {
    return 1;
  }
  return 0;
}
