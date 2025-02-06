import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Unit, Weapon} from '../types/unit';
import '../components/weapon-image';
import '../components/individual-weapon-view';
import '../components/unit-image';
import {BundleManagerService} from '../services/bundle-manager';

@customElement('weapon-view-route')
export class WeaponViewRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
        gap: var(--lumo-space-m);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin: 0;
      }

      .card {
        display: flex;
        background-color: var(--lumo-contrast-5pct);
        font-size: var(--lumo-font-size-s);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
        flex-direction: column;
      }

      .page {
        display: flex;
        flex-wrap: wrap;
        gap: var(--lumo-space-m);
      }

      .card:first-child {
        min-width: 300px;
      }

      .card {
        flex: 1 1 0px;
        padding: 20px;
        border-radius: 5px;
      }

      @media (max-width: 768px) {
        .card {
          flex-basis: 100%;
        }
      }

      @media (max-width: 768px) {
        .page {
          grid-template-columns: 1fr;
        }
      }

      .unit-images {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--lumo-space-s);
      }

      unit-image {
        border-radius: var(--lumo-border-radius-m);
        overflow: hidden;
        width: 150px;
        height: 76.6px;
        border: 1px solid var(--lumo-contrast-20pct);
      }

      .unit-card {
        display: flex;
        flex-direction: column;
        font-size: var(--lumo-font-size-xs);
        align-items: center;
      }

      a {
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .unit-name {
        font-size: 0.6rem;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        white-space: nowrap;
        width: 100%;
        padding: var(--lumo-space-xs) 0;
      }

      individual-weapon-view {
        flex: 1 1 0;
      }

      .image-wrapper {
        position: relative;
      }


      
      country-flag {
        position: absolute;
        top: 2px;
        right: 2px;
        border-radius: var(--lumo-border-radius);
        padding: 2px;
      }


      .division-flags {
        display: flex;
        gap: var(--lumo-space-xs);
        align-items: center;
        padding: var(--lumo-space-xs) 0;
      }

      division-flag {
        width: 20px;
      }
    `;
  }

  @state()
  weapon: Weapon | null = null;

  @state()
  unitsWithWeapon: Unit[] = [];

  async onBeforeEnter(location: RouterLocation) {
    const units = await BundleManagerService.getUnits();

    let foundWeapon: Weapon | null = null;
    const unitsWithWeapon: Unit[] = [];
    for (const unit of units) {
      for (const weapon of unit.weapons) {
        if (weapon.ammoDescriptorName === location.params.weaponId) {
          if (!foundWeapon) {
            foundWeapon = weapon;
          }
          unitsWithWeapon.push(unit);
        }
      }
    }

    this.weapon = foundWeapon;
    this.unitsWithWeapon = unitsWithWeapon;
  }

  render(): TemplateResult {
    return html`
      <div class="page">
        <div class="card">
          ${this.weapon
            ? html` <h2>${this.weapon?.weaponName}</h2>
                <individual-weapon-view
                  .weapon=${this.weapon}
                  .expert=${true}
                ></individual-weapon-view>`
            : html``}
        </div>

        <div class="card units">
          ${this.unitsWithWeapon.length > 0
            ? html`<h2>Units with weapon</h2>`
            : html``}
          <div class="unit-images">
            ${this.unitsWithWeapon.map((unit) => {
              return html` <a
                class="unit-card"
                href="/unit/${unit.descriptorName}/"
              >
                <div class="division-flags">
                  ${unit.divisions.map((division) => {
                    return html`<division-flag
                      .divisionId=${division}
                    ></division-flag>`;
                  })}
                </div>
                <div class="image-wrapper">
                  <unit-image .unit=${unit}></unit-image>
                  <country-flag .country=${unit.unitType.motherCountry}></country-flag>
                </div>
                <div class="unit-name">${unit.name}</div>
                </a>`;
            })}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weapon-view-route': WeaponViewRoute;
  }
}
