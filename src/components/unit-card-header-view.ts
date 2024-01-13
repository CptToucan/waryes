import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './unit-armor-view';
import './unit-weapon-view';
import './unit-info-panel-view';
import './trait-badge';
import './mod-image';
import '@vaadin/button';
import './division-flag';
import {Unit} from '../types/unit';
import {getIconForTrait} from '../utils/get-icon-for-trait';
import {getIconsWithFallback} from '../utils/get-icons-with-fallback';
import {router} from '../services/router';

/**
 * Component for rendering the details of a single unit
 */
@customElement('unit-card-header-view')
export class UnitCardHeaderView extends LitElement {
  static get styles() {
    return css`
      .top-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      a {
        color: var(--lumo-primary-color) !important;
        text-decoration: none;
        background-color: var(--lumo-contrast-5pct);

        padding: var(--lumo-space-s);
        border-radius: var(--lumo-border-radius);
        display: flex;
        justify-content: center;
        align-items: center;
        margin: var(--lumo-space-xs) 0
      }

      a > vaadin-icon {
        font-size: 12px;
      }

      div.unit-title {
        display: flex;
        flex-direction: 'column';
        width: 100%;
      }

      div.unit-title > p {
        flex-grow: 1;
        flex-shrink: 0;
        font-size: var(--lumo-font-size-m);
        color: var(--lumo-contrast-90pct);
        margin: 0;
      }

      div.unit-title p.unit-command-points {
        text-align: right;
        color: var(--lumo-primary-text-color);
        margin: 0;
        margin-left: var(--lumo-space-xs);
      }

      .traits {
        display: flex;
      }

      .icon-container {
        padding: var(--lumo-space-xs);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--lumo-space-xs);
      }

      .icons {
        display: flex;
        padding-top: var(--lumo-space-xs);
        padding-bottom: var(--lumo-space-xs);
      }

      .unit-category {
        font-size: var(--lumo-font-size-xl);
        display: flex;
        border-right: 1px dotted var(--lumo-contrast-30pct);
      }

      mod-image {
        height: 12px;
      }

      .left-side-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        column-gap: var(--lumo-space-s);
      }

      .trait-tooltip-toggle {
        position: relative;

        .trait-tooltip {
          display: none;
          position: absolute;
          top: 30px;
          background-color: #303236;
          border-radius: 2px;
          color: #fff;
          padding: 10px;
          text-transform: none;
          width: 220px;
          font-size: 11px;
        }

        .trait-tooltip div {
          padding-top: 2px;
          padding-bottom: 2px;
        }

        .trait-tooltip ul {
          padding: 2px 0px 0px 25px;
          margin: 0px;
        }

        .trait-tooltip div:first-child {
          padding-top: 0px;
        }

        .trait-tooltip div:last-child {
          padding-bottom: 0px;
        }

        .trait-tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          white-space: nowrap;
        }

        &:hover .trait-tooltip {
          display: flex;
          flex-direction: column;
        }
      }
    `;
  }

  @property()
  unit?: Unit;

  @property()
  expert = false;

  @property()
  hideExpertButton = false;

  render(): TemplateResult {
    const traits = this.unit?.specialities.slice(1) || [];
    if (this.unit) {
      const icons = getIconsWithFallback(this.unit);

      return html`
        <div class="top-bar">
          <div class="left-side-header">
            <country-flag
              .country=${this.unit?.unitType.motherCountry}
            ></country-flag>

            <mod-image .mod=${this.unit?.mod}></mod-image>
          </div>

          <div style="display: flex; gap: var(--lumo-space-xs);">
            <a
              href=${router.urlForPath('/damage-calculator/:unitId', {
                unitId: this.unit.descriptorName,
              })}
              title="Damage Calculator"
            >
              <vaadin-icon icon="waryes:calculator"></vaadin-icon>
            </a>

            ${this.hideExpertButton
              ? html``
              : html` <vaadin-button
                  theme="primary"
                  @click=${() =>
                    this.dispatchEvent(
                      new CustomEvent('mode-toggled', {detail: !this.expert})
                    )}
                  >${this.expert ? 'Simple' : 'Expert'}</vaadin-button
                >`}
          </div>
        </div>
        <div class="unit-title">
          <p class="unit-name">${this.unit?.name}</p>
          <p class="unit-command-points">${this.unit?.commandPoints}</p>
        </div>
        <div class="icons">
          <div class="unit-category icon-container">
            <vaadin-icon icon=${icons.icon}></vaadin-icon>
            ${icons.subIcon
              ? html`<vaadin-icon icon=${icons.subIcon}></vaadin-icon>`
              : html``}
          </div>
          <div class="traits">
            ${traits.map(
              (speciality) => html`<div class="icon-container">
                ${getIconForTrait(speciality)}
              </div>`
            )}
          </div>
        </div>
      `;
    }

    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-card-header-view': UnitCardHeaderView;
  }
}
