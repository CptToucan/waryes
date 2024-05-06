import {BeforeEnterObserver} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Weapon} from '../types/unit';
import '../components/weapon-image';
import '../components/mod-image';
import { BundleManagerService } from '../services/bundle-manager';

@customElement('weapons-route')
export class WeaponsRoute extends LitElement implements BeforeEnterObserver {
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
        transition: background-color 0.3s ease;
      }

      .unit:hover {
        background-color: var(--lumo-contrast-10pct);
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

      weapon-image {
        width: 50px;
      }

      a {
        text-decoration: none;
        color: inherit;
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
  weapons: Weapon[] | null = null;

  async onBeforeEnter() {
    const allWeapons = await BundleManagerService.getWeapons();

    // get weapons from units
    const weaponsByDescriptor: {
      [key: string]: Weapon;
    } = {};


      for (const weapon of allWeapons) {
        if (!weaponsByDescriptor[weapon.ammoDescriptorName]) {
          weaponsByDescriptor[weapon.ammoDescriptorName] = weapon;
        }
      }
    
    this.weapons = Object.values(allWeapons).sort((a, b) => {
      return a.weaponName.localeCompare(b.weaponName);
    });

  }

  render(): TemplateResult {
    return html`
      <h1>Weapons (${this.weapons?.length || 0})</h1>
      <div class="grid">
        ${this.weapons?.map((weapon: Weapon) => {
          return html`<div class="unit">
            <a class="header" href="/weapon/${weapon.ammoDescriptorName}">
              <weapon-image .weapon=${weapon}></weapon-image>
              <div class="unit-name">${weapon.weaponName}</div>
              <mod-image .mod=${weapon.mod}></mod-image>
        </a>
          </div>`;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weapons-route': WeaponsRoute;
  }
}
