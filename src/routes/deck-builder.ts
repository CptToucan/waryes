import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/deck/edit-deck';
import '@vaadin/scroller';
import {UnitsDatabaseService} from '../services/units-db';
import {BeforeEnterObserver} from '@vaadin/router';
// import { decodeDeckString, Deck } from '@izohek/warno-deck-utils';

// @ts-ignore
import DeckBuilderJson from '../../data/deckbuilder-data-test.json';
import {Division} from '../types/deck-builder';
import {UnitMap} from '../types/unit';
import {Deck} from '../classes/deck';

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

  constructor() {
    super();
    const divisionData: Division[] = DeckBuilderJson.divisions;
    this.availableDivisions = divisionData;
  }

  /**
   * Converts unit array in to a map to be used by the edit-deck component
   */
  async onBeforeEnter() {
    const units = await UnitsDatabaseService.fetchUnits();
    const unitMap: UnitMap = {};

    if (units) {
      for (const unit of units) {
        unitMap[unit.descriptorName] = unit;
      }
    }

    this.unitMap = unitMap;

    this.deckToEdit = new Deck(this.availableDivisions[3], this.unitMap);
  }

  /**
   * Available divisions for selections
   */
  availableDivisions: Division[];

  @state()
  deckToEdit?: Deck;

  selectDivision(division: Division) {
    if (this.unitMap) {
      this.deckToEdit = new Deck(division, this.unitMap);
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
