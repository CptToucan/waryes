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
import { DivisionsDatabaseService } from '../services/divisions-db';

@customElement('deck-builder-route')
export class DeckBuilderRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      vaadin-button {
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
      }
    `;
  }

  unitMap?: UnitMap;
  divisionsMap?: DivisionsMap;

  constructor() {
    super()
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
      this.fetchDivisionMap()
    ])

    this.unitMap = units
    this.divisionsMap = divisions

    this.availableDivisions = Object.values(this.divisionsMap);

    // TODO: this is hard coded for testing, remove to show division list to start a new deck instead
    let deckString = "FBF8aMS0fYAEfYANEgAGMQAKL4AKO0RFkBBsq5BkeIAEgoAKNQ/WNRBkq0Vkq0VktZ82NsRKU0RKT4AKKsVFtYAGLwAGOsVFOwAMfgAGI0RErERGPIAGPgAGMoAGPQAFrx80gcREgcRKT4AGNEVAgA==";
    let deckFromString = Deck.fromDeckCode(deckString, {
      unitMap: units,
      divisions: this.availableDivisions
    });

    this.selectedDivision = deckFromString.division
    this.deckToEdit = deckFromString
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
        divisionMap[division.descriptor] = division
      }
    }

    return divisionMap;
  }


  /**
   * Currently selected division
   */
  @state()
  selectedDivision?: Division ;


  /**
   * Available divisions for selections
   */
  availableDivisions: Division[] = []

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
    return html`<div>
      ${this.availableDivisions.map(
        (div) =>
          html`<vaadin-button @click=${() => this.selectDivision(div)}
            >${div.descriptor}</vaadin-button
          >`
      )}
    </div>`;
  }
}
