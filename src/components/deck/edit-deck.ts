import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './armoury-card';
import './deck-card';
import '@vaadin/scroller';
import {Division, Pack} from '../../types/deck-builder';
import {UnitMap} from '../../types/unit';

type GroupedUnits = {
  [key: string]: Pack[];
};

type FactoryDescriptorMap = {
  [key: string]: string;
};

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

@customElement('edit-deck')
export class EditDeck extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex: 0 0 100%;
        height: 100%;
      }
      .container {
        grid-template-areas: 'deck cards cards cards cards cards cards filters';
        display: grid;
        flex: 1 1 0;
        max-height: 100%;
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);

        overflow: hidden;
      }

      .deck {
        grid-area: deck;
        border-right: 1px solid var(--lumo-contrast-10pct);
        padding: var(--lumo-space-s);
        height: 100%;
        overflow: auto;
      }

      .card-section h3 {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-contrast-90pct);
      }

      .cards {
        grid-area: cards;
        height: 100%;
        overflow: auto;
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
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

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
    `;
  }

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

  parseDescriptorName(descriptor: string): string {
    const splitDescriptor = descriptor.split('/');
    return splitDescriptor[splitDescriptor.length - 1];
  }

  renderDeckCategory(name: string, cards: number[]): TemplateResult {
    return html`<div class="deck-section">
      <div class="deck-category-headings">
        <div class="deck-category-heading-row">
          <h3 class="deck-category-heading-title">${name}</h3>
          <div>22 units</div>
        </div>
        <div class="deck-category-heading-row">
          <div>8 / 10 slots</div>
          <div>Next slot: 3 points</div>
        </div>
      </div>
      <div class="deck-category-cards">
        ${cards.map(() => html`<deck-card></deck-card>`)}
      </div>
    </div>`;
  }

  renderCardCategories(groupedUnits: GroupedUnits) {
    const renderOutput: TemplateResult[] = [];

    if (this.division?.costMatrix?.matrix) {
      for (const matrixRow of this.division?.costMatrix?.matrix) {
        renderOutput.push(
          this.renderCardCategory(matrixRow.name, groupedUnits[matrixRow.name])
        );
      }
    }

    return renderOutput;
  }

  renderCardCategory(name: string, packs: Pack[]): TemplateResult {
    return html`<div class="card-section">
      <div><h3>${name}</h3></div>

      <div class="armoury-category-cards">
        ${packs.map(
          (pack) => html`<armoury-card .pack=${pack} .unitMap=${this.unitMap}></armoury-card>`
        )}
      </div>
    </div>`;
  }

  render(): TemplateResult {

    const groupedUnits: GroupedUnits = {};

    if (this.division?.costMatrix?.matrix) {
      for (const category of this.division?.costMatrix?.matrix) {
        groupedUnits[category.name] = [];
      }
    }

    groupedUnits['NOT_DEFINED'] = [];

    if (this?.division?.packs) {
      for (const pack of this.division.packs) {
        const unitDescriptor = this.parseDescriptorName(pack.unitDescriptor);
        const unit = this.unitMap?.[unitDescriptor];
        if (unit && unit.factoryDescriptor) {
          const parsedFactoryDescriptor =
            factoryDescriptorMap[unit.factoryDescriptor];
          if (parsedFactoryDescriptor !== undefined) {
            groupedUnits[parsedFactoryDescriptor].push(pack);
          } else {
            groupedUnits['NOT_DEFINED'].push(pack);
          }
        }
      }
    }



    return html`
      <div class="container">
        <div class="deck">
          <h3 class="deck-title">${this.division?.descriptor}</h3>

        </div>
        <div class="cards">
          ${this.renderCardCategories(groupedUnits)}
          <div class="filters">Filters</div>
        </div>
      </div>
    `;
  }
}
