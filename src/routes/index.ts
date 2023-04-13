import {css, html, LitElement, TemplateResult /*, unsafeCSS*/} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
// import BackgroundImage from '../../images/home-background.png';
import '@vaadin/multi-select-combo-box';
import '@vaadin/combo-box';
import '../components/unit-search';
import {Unit} from '../types/unit';
import {Router} from '@vaadin/router';

@customElement('index-route')
export class IndexRoute extends LitElement {
  static get styles() {
    // const backgroundImage = unsafeCSS(`"url(${BackgroundImage})"`);

    return css`
      :host {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .splash {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: var(--lumo-space-xl);
      }

      h2 {
        margin: 0;
      }

      .search {
        padding-top: var(--lumo-space-xl);
        align-self: stretch;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-left: var(--lumo-space-xl);
        padding-right: var(--lumo-space-xl);
      }

      unit-search {
        flex: 1 1 0;
        max-width: 512px;
      }

      .or {
        font-size: var(--lumo-font-size-l);
        padding-top: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
      }

      button {
        all: unset;
        cursor: pointer;
      }

      .menu-buttons {
        display: flex;
        flex-direction: row;
        flex: 1 1 100%;
        align-items: stretch;
        padding: var(--lumo-space-s);
        flex-wrap: wrap;
      }

      .container {
        // height: 100%;
        display: flex;
        flex-direction: column;
      }

      .button-grid {
        display: grid;
        padding: var(--lumo-space-s);
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--lumo-space-xs);
      }

      a.choice-button {
        border-radius: var(--lumo-border-radius-m);
        padding: var(--lumo-space-m);
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-direction: column;
        color: var(--lumo-contrast-80pct);
        border: 2px solid transparent;
        flex: 1 1 0;
        font-size: var(--lumo-font-size-l);
        height: var(--lumo-size-xxl);
        text-align: center;
        text-decoration: none;
        user-select: none;
      }

      .headline {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--lumo-space-l);
        padding-top: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
      }

      a.choice-button.disabled {
        opacity: 0.4;
        cursor: unset;
      }

      a.choice-button vaadin-icon {
        color: var(--lumo-primary-color);
      }

      a.choice-button span {
        color: var(--lumo-contrast-60pct);
      }

      a.choice-button.disabled:hover {
        background-color: var(--lumo-contrast-5pct);
      }

      a.choice-button:hover {
        background-color: var(--lumo-contrast-10pct);
      }

      a:focus {
        border: 2px solid var(--lumo-primary-color-50pct);
      }
    `;
  }

  unitSelected(event: CustomEvent) {
    if (event.detail.value as Unit) {
      Router.go(`/unit/${event.detail.value?.descriptorName}`);
    }
  }

  renderSelectOrImportChoice() {
    return html` <div class="container menu-buttons button-grid">
      <a class="choice-button" href="/deck-import">
        <div class="headline">
          <vaadin-icon icon="vaadin:code"></vaadin-icon>
          <h2>Import</h2>
        </div>

        <span>Got a deck code? Import it here and start editing.</span>
      </a>

      <a class="choice-button" href="/deck-builder">
        <div class="headline">
          <vaadin-icon icon="vaadin:tools"></vaadin-icon>
          <h2>Build</h2>
        </div>
        <span>Build a deck from scratch.</span>
      </a>

      <a class="choice-button" href="/deck-library">
        <div class="headline">
          <vaadin-icon icon="vaadin:book"></vaadin-icon>
          <h2>Browse</h2>
        </div>
        <span>Have a look around the deck library.</span>
      </a>

      <a class="choice-button" href="/units">
        <div class="headline">
          <vaadin-icon icon="vaadin:table"></vaadin-icon>
          <h2>Explore</h2>
        </div>
        <span>Inspect the armoury.</span>
      </a>

      <a class="choice-button" href="/comparison">
        <div class="headline">
          <vaadin-icon icon="vaadin:pie-bar-chart"></vaadin-icon>
          <h2>Compare</h2>
        </div>
        <span>Compare units and analyse.</span>
      </a>
    </div>`;
  }

  render(): TemplateResult {
    return html`
      <div class="background">
        <div class="container">
          <div class="splash">
            <img height="86" src=${WaryesImage} />
            <div class="search">
              <unit-search @unit-selected=${this.unitSelected}></unit-search>
            </div>
          </div>
        </div>

        ${this.renderSelectOrImportChoice()}
      </div>
    `;
  }
}
