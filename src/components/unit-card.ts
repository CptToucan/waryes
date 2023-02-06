import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {TabsSelectedChangedEvent} from '@vaadin/tabs';
import '@vaadin/tabs';
import {Unit, Weapon} from '../types/unit';

/**
 * Component for rendering the details of a single unit
 */
@customElement('unit-card')
export class UnitCard extends LitElement {
  static get styles() {
    return css`
      p {
        margin: 0;
        padding: 0;
      }

      :host {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        border-radius: var(--lumo-border-radius-m);
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        min-width: 300px;
        overflow: hidden;
      }

      .unit-card {
        width: 100%;
      }

      div.unit-title {
        display: flex;
        flex-direction: 'column';
        width: 100%;
      }

      div.unit-title > p {
        flex-grow: 1;
        font-size: var(--lumo-font-size-xl);
        margin: 0;
      }

      div.unit-title p.unit-command-points {
        text-align: right;
        color: var(--lumo-primary-text-color);
        margin: 0;
      }



      .weapons-tab table {
        width: 100%;
        border-collapse: collapse;
      }

      .weapons-tab table td {
        padding: var(--lumo-space-xs) 0;
        margin: var(--lumo-space-s) 0;
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
      }

      .weapons-tab table tr.weapon-stat-border-bottom td {
        border-bottom: 1px solid var(--lumo-primary-color-10pct);
      }

      .unit-bottom-stats {
        margin-top: var(--lumo-space-l);
        color: var(--lumo-contrast);
        display: flex;
        flex-wrap: wrap;
      }

      .unit-bottom-stats > div {
        flex: 1 1 45%;
        text-align: left;
        display: flex;
        flex-direction: row;
        padding: var(--lumo-space-xs) var(--lumo-space-xs);
      }

      .unit-bottom-stats div p {
        flex-grow: 1;
        margin: 0;
      }

      .unit-bottom-stats div {
        border-bottom: 1px solid var(--lumo-primary-color-10pct);
      }

      .unit-bottom-stats div p:nth-child(1) {
        color: var(--lumo-contrast-70pct);
      }

      .unit-bottom-stats div p:nth-child(2) {
        text-align: right;
        color: var(--lumo-contrast-100pct);
      }
    `;
  }

  @property()
  unit?: Unit;

  @property()
  compact = true;

  @state()
  private selectedWeapon = 0;

  private selectedWeaponTabChanged(event: TabsSelectedChangedEvent) {
    this.selectedWeapon = event.detail.value;
  }

  renderTitleRow(): TemplateResult {
    return html` <div class="unit-title">
      <p class="unit-name">${this.unit?.name}</p>
      <p class="unit-command-points">${this.unit?.commandPoints}</p>
    </div>`;
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
            ${this.renderWeaponTabRow('Ground', weapon.groundRange)}
            ${this.renderWeaponTabRow('Helicopter', weapon.helicopterRange)}
            ${this.renderWeaponTabRow(
              'Aircraft',
              weapon.planeRange,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Static', weapon.staticAccuracy)}
            ${this.renderWeaponTabRow(
              'Motion',
              weapon.movingAccuracy,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Rate of Fire', weapon.rateOfFire)}
            ${this.renderWeaponTabRow('Aiming Time', weapon.aimingTime)}
            ${this.renderWeaponTabRow('Reload Time', weapon.reloadTime)}
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

  renderUnitBottomStats(): TemplateResult {
    /*
            ${this.renderUnitBottomStatsItem(
          'Reveal Influence',
          'DATA SOURCE: TODO'
        )}
        */
    return html`
      <div class="unit-bottom-stats">
        ${this.renderUnitBottomStatsItem('Strength', this.unit?.maxDamage)}
        ${this.renderUnitBottomStatsItem('Optics', this.unit?.optics)}
        ${this.renderUnitBottomStatsItem('Stealth', this.unit?.stealth)}
        ${this.renderUnitBottomStatsItem('Max Damage', this.unit?.maxDamage)}
        ${this.renderUnitBottomStatsItem('Air Optics', this.unit?.airOptics)}
        ${this.renderUnitBottomStatsItem('ECM', this.unit?.ecm)}
        ${this.renderUnitBottomStatsItem('Agility', this.unit?.agility)}
        ${this.renderUnitBottomStatsItem('Travel Time', this.unit?.travelTime)}
        ${this.renderUnitBottomStatsItem('Speed', this.unit?.speed)}
        ${this.renderUnitBottomStatsItem('Road Speed', this.unit?.roadSpeed)}
        ${this.renderUnitBottomStatsItem('Fuel Move', this.unit?.fuelMove)}
        ${this.renderUnitBottomStatsItem('Fuel', this.unit?.fuel)}
        ${this.renderUnitBottomStatsItem('Supply Cost', this.unit?.supply)}
      </div>
    `;
  }

  renderUnitBottomStatsItem(name: string, value: any) {
    return html`
      <div>
        <p>${name}</p>
        <p>${value}</p>
      </div>
    `;
  }

  renderWeaponsRow(compact: boolean): TemplateResult {
    if (compact) {
      return html`
        <vaadin-tabs
          theme="equal-width-tabs center"
          style="max-width: 100%;"
          @selected-changed="${this.selectedWeaponTabChanged}"
        >
          ${this.renderWeaponTabs()}
        </vaadin-tabs>

        ${this.unit &&
        this.renderWeaponStats(this.unit.weapons[this.selectedWeapon])}
      `;
    } else {
      return html`
        <div
          style="display: flex; flex-direction: row; justify-content: space-between;"
        >
          ${this.unit?.weapons.map((weaponMetadata) =>
            this.renderWeaponStats(weaponMetadata)
          )}
        </div>
      `;
    }
  }

  render() {
    return html` <div class="unit-card">
      ${this.renderTitleRow()}
      <unit-armor-view .unit=${this.unit}></unit-armor-view>
      ${this.renderWeaponsRow(this.compact)} ${this.renderUnitBottomStats()}
    </div>`;
  }
}



declare global {
  interface HTMLElementTagNameMap {
    'unit-card': UnitCard;
  }
}