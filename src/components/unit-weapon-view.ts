import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Unit, Weapon} from '../types/unit';
import {TabsSelectedChangedEvent} from '@vaadin/tabs';
import '@vaadin/tabs';
import { displayDistance } from '../utils/unit-stats/display-distance';
import { displayTime } from '../utils/unit-stats/display-time';
import { displayPercentage } from '../utils/unit-stats/display-percentage';

@customElement('unit-weapon-view')
export class UnitWeaponView extends LitElement {
  static get styles() {
    return css`.weapons-tab table {
      width: 100%;
      border-collapse: collapse;
    }

    vaadin-tab {
      font-size: var(--lumo-font-size-s);
    }

    .weapons-tab table td {
      color: var(--lumo-contrast);
    }

    .weapons-tab table td:nth-child(1) {
      color: var(--lumo-contrast-70pct);
      font-size: 14px;
    }

    .weapons-tab table td:nth-child(2) {
      text-align: right;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 200px;
      font-size: 14px;
    }

    .weapons-tab table tr.weapon-stat-border-bottom td {
      border-bottom: 1px dotted var(--lumo-contrast-30pct);
    }`;
  }

  @property()
  unit?: Unit;

  @state()
  private selectedWeapon = 0;

  private selectedWeaponTabChanged(event: TabsSelectedChangedEvent) {
    this.selectedWeapon = event.detail.value;
  }

  renderWeaponTabs(): TemplateResult[] {
    const tabs = (this.unit?.weapons ?? [])
      .filter((w) => Object.keys(w).length > 0)
      .map((weapon) => {
        return html`<vaadin-tab>${weapon.weaponName}</vaadin-tab>`;
      });

    return tabs;
  }

  renderWeaponStats(weapon: Weapon): TemplateResult {
    return html`
      <div class="weapons-tab">
        <table>
          <tbody>
            ${this.renderWeaponTabRow(
              'Name',
              weapon.weaponName,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Penetration', weapon.penetration)}
            ${this.renderWeaponTabRow('HE', weapon.he)}
            ${this.renderWeaponTabRow(
              'Suppress',
              weapon.suppress,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Ground', displayDistance(weapon.groundRange))}
            ${this.renderWeaponTabRow('Helicopter', displayDistance(weapon.helicopterRange))}
            ${this.renderWeaponTabRow(
              'Aircraft',
              displayDistance(weapon.planeRange),
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Static', displayPercentage(weapon.staticAccuracy))}
            ${this.renderWeaponTabRow(
              'Motion',
              displayPercentage(weapon.movingAccuracy),
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Rate of Fire', weapon.rateOfFire)}
            ${this.renderWeaponTabRow('Aiming Time', displayTime(weapon.aimingTime))}
            ${this.renderWeaponTabRow('Reload Time', displayTime(weapon.reloadTime))}
            ${this.renderWeaponTabRow(
              'Salvo Length',
              weapon.salvoLength,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Supply Cost', weapon.supplyCost)}
          </tbody>
        </table>
      </div>
    `;
  }

  renderWeaponTabRow(
    name: string,
    value: unknown,
    className?: string
  ): TemplateResult {
    return html`
      <tr class="weapons-tab-row ${className}">
        <td>${name}</td>
        <td>${value}</td>
      </tr>
    `;
  }

  render(): TemplateResult {
    let weaponMetadata: Weapon | null = null;

    if (
      this.unit?.weapons &&
      this.unit?.weapons.length > 0 &&
      this.unit?.weapons[this.selectedWeapon]
    ) {
      weaponMetadata = this.unit.weapons[this.selectedWeapon];
      return html`
      <vaadin-tabs
        theme="equal-width-tabs center"
        style="max-width: 100%; "
        @selected-changed="${this.selectedWeaponTabChanged}"
      >
        ${this.renderWeaponTabs()}
      </vaadin-tabs>

      ${weaponMetadata && this.renderWeaponStats(weaponMetadata)}
    `;
    }
    
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-weapon-view': UnitWeaponView;
  }
}
