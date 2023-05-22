import {css, html, LitElement, TemplateResult /*, unsafeCSS*/} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
// @ts-ignore
import WarnoImage from '../../images/warno.png';
// @ts-ignore
import FragoImage from '../../images/frago-transparent.png';
// @ts-ignore
import WarnoLetLooseImage from '../../images/warno-let-loose-transparent.png';
import '@vaadin/multi-select-combo-box';
import '@vaadin/combo-box';
import '@vaadin/checkbox-group';
import '@vaadin/checkbox';
import "../components/mod-image";

import '../components/unit-search';
import {Unit} from '../types/unit';
import {Router} from '@vaadin/router';
import "../components/mod-selector";

@customElement('index-route')
export class IndexRoute extends LitElement {
  static get styles() {

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
        align-self: stretch;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-left: var(--lumo-space-xs);
        padding-right: var(--lumo-space-xs);
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

  renderChoiceButton(
    href: string,
    icon: string,
    headline: string,
    description: string,
    disabled = false
  ) {
    return html` <a
      class="choice-button ${disabled ? 'disabled' : ''}"
      href="${href}"
    >
      <div class="headline">
        <vaadin-icon icon="${icon}"></vaadin-icon>
        <h2>${headline}</h2>
      </div>

      <span>${description}</span>
    </a>`;
  }

  renderSelectOrImportChoice() {
    const choices = [
      this.renderChoiceButton(
        '/deck-import',
        'vaadin:code',
        'Import',
        'Got a deck code? Import it here and start editing.'
      ),
      this.renderChoiceButton(
        '/deck-builder',
        'vaadin:tools',
        'Build',
        'Build a deck from scratch.'
      ),
      this.renderChoiceButton(
        '/deck-library',
        'vaadin:book',
        'Browse',
        'Browse decks from the community.'
      ),
      this.renderChoiceButton(
        '/units',
        'vaadin:table',
        'Explore',
        'Inspect the armoury.'
      ),
      this.renderChoiceButton(
        '/comparison',
        'vaadin:pie-bar-chart',
        'Compare',
        'Compare units and analyse.'
      ),
    ];

    return html` <div class="container menu-buttons button-grid">
      ${choices}
    </div>`;
  }

  render(): TemplateResult {
    return html`
      <div class="background">
        <div class="container">
          <div class="splash">
            <img height="86" src=${WaryesImage} />

            <div>
              <mod-selector></mod-selector>

              <div class="search">
                <unit-search @unit-selected=${this.unitSelected}></unit-search>
              </div>
            </div>
          </div>
        </div>
        ${this.renderSelectOrImportChoice()}
      </div>
    `;
  }
}
