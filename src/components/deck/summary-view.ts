import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {Deck} from '../../classes/deck';
import {UnitCategory} from '../../types/deck-builder';
import {getCodeForFactoryDescriptor} from '../../utils/get-code-for-factory-descriptor';
import {toBlob} from 'html-to-image';
import './compact-armoury-card';
import './deck-header';
import {styleMap} from 'lit-html/directives/style-map.js';

@customElement('summary-view')
export class SummaryView extends LitElement {
  static get styles() {
    return css`
      vaadin-button.fab {
        position: absolute;
        top: 0;
        right: var(--lumo-space-xs);
        z-index: 1;
      }

      :host {
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .container {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: var(--lumo-space-xs);
        padding-top: 
      }

      h2,
      h3,
      h4 {
        margin: 0;
      }

      @media only screen and (max-width: 700px) {
        .division-title {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: unset;
          white-space: nowrap;
        }
      }

      country-flag {
        margin-left: var(--lumo-space-s);
      }

      .armoury-category-cards {
        display: grid;
        padding: var(--lumo-space-xs);
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--lumo-space-xs);
      }

      .card-section h4 {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        color: var(--lumo-contrast-90pct);
      }

      .category-stats {
        display: flex;
        color: var(--lumo-contrast-80pct);
        font-size: var(--lumo-font-size-s);
      }

      .category-stats > * {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }

      .screenshot-cover {
        position: fixed;
        height: 100vh;
        width: 100vw;
        top: 0;
        left: 0;
        background-color: var(--lumo-base-color);
        z-index: 1;
        padding: var(--lumo-space-l);
      }

      vaadin-details {
        margin: 0;
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        border: 1px solid var(--lumo-contrast-10pct);
      }

      vaadin-details.screenshot-mode:first-of-type {
        margin-top: -60px !important;
      }

      vaadin-details::part(summary) {
        padding-top: 0;
        padding-bottom: 0;
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
      }
      vaadin-details::part(content) {
        padding: 0;
      }
    `;
  }

  @property()
  deck?: Deck;

  @property()
  showTitle = false;

  @state()
  takingScreenshot = false;

  @query('#root')
  root!: HTMLElement;

  async captureImage() {
    // this.root.style.width = '1400px';
    this.takingScreenshot = true;
    // timeout for 5ms to allow the dom to update
    await new Promise((resolve) => setTimeout(resolve, 5));
    const blob = await toBlob(this.root, {
      backgroundColor: '#1a1a1e',
    });


    // save blob as png file
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob as Blob);
    a.download = `${this.deck?.division.name}.png`;
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);

    this.takingScreenshot = false;
  }

  render(): TemplateResult {
    const styles = {
      width: this.takingScreenshot ? '1400px' : '',
      paddingTop: this.takingScreenshot ? '0px' : 'var(--lumo-space-xl)',
      paddingLeft: this.takingScreenshot ? 'var(--lumo-space-xs)' : '0',
      paddingRight: this.takingScreenshot ? 'var(--lumo-space-xs)' : '0',
      paddingBottom: this.takingScreenshot ? 'var(--lumo-space-xs)' : '0',
    };

    if (this.deck) {
      return html`<vaadin-button
          class="fab"
          theme="small primary icon"
          @click=${this.captureImage}
        >
          <vaadin-icon icon="vaadin:picture"></vaadin-icon>
        </vaadin-button>
        ${this.takingScreenshot
          ? html` <div class="screenshot-cover">Downloading image...</div>`
          : html``}
        <div id="root" class="container" style=${styleMap(styles)}>
          ${this.takingScreenshot
            ? html` <deck-title
                  .deck=${this.deck}
                  .name=${this.deck.division.name}
                ></deck-title>
                <deck-header .deck=${this.deck}> </deck-header>`
            : html``}
          ${this.renderDeckCategories(this.deck)}
        </div>`;
    }

    return html`NO DECK TO VIEW`;
  }

  renderDeckCategories(deck: Deck) {
    const renderOutput: TemplateResult[] = [];

    for (const category of deck.unitCategories) {
      renderOutput.push(this.renderDeckCategory(category, deck));
    }

    return renderOutput;
  }

  renderDeckCategory(category: UnitCategory, deck: Deck) {
    const unitsInDeckCategory =
      deck.unitsInDeckGroupedUnitsByCategory[category];

    const numberOfCardsInCategory = unitsInDeckCategory.length;
    const unitsInDeckCategoryToRender: TemplateResult[] = [];

    for (const deckUnit of unitsInDeckCategory) {
      unitsInDeckCategoryToRender.push(html`<compact-armoury-card
        .deck=${deck}
        .pack=${deckUnit?.pack}
        .transport=${deckUnit?.transport}
        .selectedVeterancy=${deckUnit?.veterancy}
      ></compact-armoury-card>`);
    }

    return html`<vaadin-details
      ?opened=${true}
      class="card-section ${this.takingScreenshot ? 'screenshot-mode' : ''}"
    >
      <div class="category-stats" slot="summary">
        <h4>${getCodeForFactoryDescriptor(category)}</h4>
        <div class="unit-count">
          ${deck.getTotalUnitCountForCategory(category)} units
        </div>
        <div class="slot-count">
          ${numberOfCardsInCategory} /
          ${deck.getTotalSlotsForCategory(category)} slots
        </div>
        <div class="total-points-in-category">
          ${deck.getSumOfUnitCostsForCategory(category)} points
        </div>
      </div>

      <div class="armoury-category-cards">${unitsInDeckCategoryToRender}</div>
    </vaadin-details>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'summary-view': SummaryView;
  }
}
