import {BeforeEnterObserver} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import { BundleManagerService } from '../services/bundle-manager';
import {Unit} from '../types/unit';
import {getIconsWithFallback} from '../utils/get-icons-with-fallback';

@customElement('units-route')
export class UnitsRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: var(--lumo-space-m);
      }

      .unit {
        display: flex;
        background-color: var(--lumo-contrast-5pct);
        font-size: var(--lumo-font-size-s);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
        height: 25px;
        align-items: center;
        overflow: hidden;
      }

      a {
        text-decoration: none;
        color: inherit;
      }

      .grid {
        flex: 1 1 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        grid-gap: var(--lumo-space-m);
      }

      .unit-name {
        display: flex;
        flex: 1 1 0;
        align-items: center;
        font-size: var(--lumo-font-size-xs);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .header {
        display: flex;
        gap: var(--lumo-space-s);
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      country-flag {
        overflow: hidden;
        height: 20px;
      }

      mod-image {
        height: 8px;
      }
    `;
  }

  @state()
  units: Unit[] = [];

  async onBeforeEnter() {
    let units = await BundleManagerService.getUnits();
    console.log(units);
    // sort by motherCountry

    units = units.sort((a, b) => {
      const iconA = getIconsWithFallback(a);
      const iconB = getIconsWithFallback(b);
      if ((iconA.icon || '') < (iconB.icon || '')) {
        return -1;
      }
      if ((iconA.icon || '') > (iconB.icon || '')) {
        return 1;
      }
      return 0;
    });

    this.units = units;
  }

  render(): TemplateResult {
    return html`
      <h1>Units</h1>
      <div class="grid">
        ${this.units.map((unit) => {
          const icons = getIconsWithFallback(unit);

          return html`<a class="unit" href="/unit/${unit.descriptorName}">
            <div class="header">
              <vaadin-icon .icon=${icons.icon}></vaadin-icon>

              <div class="unit-name">${unit.name}</div>
              <mod-image .mod=${unit.mod}></mod-image>
              <country-flag
                .country=${unit.unitType.motherCountry}
              ></country-flag>
            </div>
          </a>`;
        })}
      </div>
    `;
  }
}
