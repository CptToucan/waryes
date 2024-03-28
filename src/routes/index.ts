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
import '../components/mod-image';

import '../components/unit-search';
import {Unit} from '../types/unit';
import {Router} from '@vaadin/router';

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
        margin-bottom: var(--lumo-space-m);
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
        min-width: 320px;
      }

      unit-search {
        flex: 1 1 0;
        max-width: 512px;
        margin-top: var(--lumo-space-m);
        margin-bottom: var(--lumo-space-m);
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

      .container {
        // height: 100%;
        display: flex;
        flex-direction: column;
      }

      .button-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--lumo-space-xs);
        max-width: 800px;
        overflow: hidden;
        width: 100%;
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
      }

      .button-category {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      a.choice-button {
        border-radius: var(--lumo-border-radius-m);
        padding: var(--lumo-space-xs);
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-direction: column;
        color: var(--lumo-contrast-80pct);
        border: 2px solid transparent;
        font-size: var(--lumo-font-size-xs);
        height: var(--lumo-size-xxl);
        text-align: center;
        text-decoration: none;
        user-select: none;
        flex: 1 1 100%;
        height: 110px;
      }

      .headline {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--lumo-space-s);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        height: 100%;
        justify-content: space-around;
      }

      .socials {
        display: flex;
        justify-content: center;
        gap: var(--lumo-space-m);
        margin-top: var(--lumo-space-l);
        padding-top: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
        flex-wrap: wrap;
      }

      .social {
        display: flex;
        flex-direction: column;
        width: 256px;
      }

      .social img {
        margin-bottom: var(--lumo-space-m);
      }

      .social div {
        text-align: center;
      }

      a {
        text-decoration: none;
      }

      a:visited {
        color: var(--lumo-body-text-color);
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

      h3 {
        margin: 0;
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
    </a>`;
  }

  renderSelectOrImportChoice() {
    const databaseChoices = [
      this.renderChoiceButton('/units', 'waryes:soldier', 'Browse Units'),
      this.renderChoiceButton('/weapons', 'waryes:gun', 'Browse Weapons'),
      this.renderChoiceButton(
        '/damage-calculator',
        'waryes:calculator',
        'Damage Calculator'
      ),
      this.renderChoiceButton(
        '/comparison',
        'vaadin:pie-bar-chart',
        'Compare Units'
      ),
      this.renderChoiceButton('/maps', 'vaadin:map-marker', 'Maps'),
    ];

    const deckChoices = [
      this.renderChoiceButton('/deck-drafter', 'vaadin:random', 'Deck Draft'),
      this.renderChoiceButton('/deck-import', 'vaadin:code', 'Deck Import'),
      this.renderChoiceButton('/deck-builder', 'vaadin:tools', 'Deck Build'),
      this.renderChoiceButton('/deck-library', 'vaadin:book', 'Deck Library'),
    ];

    const inspectChoices = [
      this.renderChoiceButton(
        '/patch-notes',
        'vaadin:clipboard-text',
        'Patch Notes'
      ),
      this.renderChoiceButton(
        '/division-analysis',
        'vaadin:chart',
        'Division Analysis'
      ),
    ];

    return html`
      <div class="button-grid">
        <a class="choice-button" href="/defcon2">
          <div class="headline">
            <img style="width: 100%;" src="/defcon-2-tagline.png" />
          </div>
        </a>

        ${databaseChoices} ${deckChoices} ${inspectChoices}
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div class="background">
        <div class="container">
          <div class="splash">
            <a href="/defcon2">
              <img
                height="100"
                src="/defcon-2-tagline-invitation.png"
                style="margin-top: 20px;"
              />
            </a>
            <div>
              <div class="search">
                <unit-search @unit-selected=${this.unitSelected}></unit-search>
              </div>
            </div>
            ${this.renderSelectOrImportChoice()}
            <div class="socials">
              <a class="social" href="https://discord.gg/gqBgvgGj8H">
                <img style="height: 32px" src="/discord-logo-white.svg" />
                <div>Feel free to join our Discord community.</div>
              </a>

              <a class="social" href="https://www.patreon.com/WarYes">
                <img style="height: 32px" src="/patreon-logo-white.svg" />
                <div>Support the project on Patreon.</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
