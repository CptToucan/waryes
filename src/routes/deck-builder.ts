import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/deck/edit-deck';
import '@vaadin/scroller';
import { UnitsDatabaseService } from '../services/units-db';
import { BeforeEnterObserver } from '@vaadin/router';
// import { decodeDeckString, Deck } from '@izohek/warno-deck-utils';


// @ts-ignore
import DeckBuilderJson from '../../data/deckbuilder-data-test.json';
import {Division} from '../types/deck-builder';
import { UnitMap } from '../types/unit';

@customElement('deck-builder-route')
export class DeckBuilderRoute extends LitElement implements BeforeEnterObserver {
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
    super()
    const divisionData: Division[] = DeckBuilderJson.divisions;
    this.availableDivisions = divisionData;
    this.selectedDivision = this.availableDivisions[12];
    // console.log(divisionData);
    // console.log(decodeDeckString("FBF8aMS0fYAEfYANEgAGMQAKL4AKO0RFkBBsq5BkeIAEgoAKNQ/WNRBkq0Vkq0VktZ82NsRKU0RKT4AKKsVFtYAGLwAGOsVFOwAMfgAGI0RErERGPIAGPgAGMoAGPQAFrx80gcREgcRKT4AGNEVAgA=="))
  }

  /**
   * Converts unit array in to a map to be used by the edit-deck component
   */
  async onBeforeEnter() {
    const units = await UnitsDatabaseService.fetchUnits();
    const unitMap: UnitMap = {};

    if(units) {
      for(const unit of units) {
        unitMap[unit.descriptorName] = unit
      }
    }

    this.unitMap = unitMap
  }



  /**
   * Currently selected division
   */
  @state()
  selectedDivision?: Division ;


  /**
   * Available divisions for selections
   */
  availableDivisions: Division[]



  selectDivision(division: Division) {
    this.selectedDivision = division;
  }

  render(): TemplateResult {
    if(this.selectedDivision && this.unitMap) {
      return this.renderDeckEditorForDivision(this.selectedDivision, this.unitMap)
    }
    return this.renderDivisionSelection()
  }

  renderDeckEditorForDivision(division: Division, unitMap: UnitMap): TemplateResult {
    return html`<edit-deck .division=${division} .unitMap=${unitMap}></edit-deck>`;
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
