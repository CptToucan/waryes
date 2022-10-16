import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {TabsSelectedChangedEvent} from '@vaadin/tabs';
import '@vaadin/tabs';
import {Unit, WeaponMetaData} from '../types/unit';

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
        justify-content: center;
        align-items: center;
        border-radius: var(--lumo-border-radius-m);
        padding-left: var(--lumo-space-l);
        padding-right: var(--lumo-space-l);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
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

      vaadin-tab {
        padding: var(--lumo-space-m);
      }


      .weapons-tab table {
        width: 100%;
        border-collapse: collapse;
      }

      .weapons-tab table td {
        padding: var(--lumo-space-s) 0;
        color: var(--lumo-contrast);
      }

      
      .weapons-tab table td:nth-child(1) {
        color: var(--lumo-contrast-70pct);
      }

      .weapons-tab table td:nth-child(2) {
        text-align: right;
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
        width: 45%;
        flex-grow: 1;
        text-align: left;
        display: flex;
        flex-direction: row;
        padding: 0 var(--lumo-space-s);
      }

      .unit-bottom-stats div p {
        flex-grow: 1;
        margin: 0;
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

  @state()
  private selectedWeapon = 0;

  private selectedWeaponTabChanged(event: TabsSelectedChangedEvent) {
    this.selectedWeapon = event.detail.value;
  }

  renderTitleRow(): TemplateResult {
    return html` <div class="unit-title">
      <p class="unit-name">${this.unit?._name}</p>
      <p class="unit-command-points">${this.unit?.commandPoints}</p>
    </div>`;
  }

  renderWeaponTabs(): TemplateResult[] {
    const tabs = (this.unit?.weaponMetadata ?? [])
      .filter((w) => Object.keys(w).length > 0)
      .map((weapon) => {
        return html`<vaadin-tab>${weapon.name}</vaadin-tab>`;
      });

    return tabs;
  }

  renderWeaponStats(weapon: WeaponMetaData): TemplateResult {
    return html`
      <div class="weapons-tab">
        <table>
          <tbody>
            ${this.renderWeaponTabRow('Name', weapon.name)}
            ${this.renderWeaponTabRow(
              'Ammunition',
              weapon.ammunition,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Penetration', weapon.penetration)}
            ${this.renderWeaponTabRow('HE', weapon.he)}
            ${this.renderWeaponTabRow(
              'Suppress',
              weapon.suppress,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Ground', weapon.ground)}
            ${this.renderWeaponTabRow('Helicopter', weapon.helicopter)}
            ${this.renderWeaponTabRow(
              'Aircraft',
              weapon.aircraft,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Static', weapon.static)}
            ${this.renderWeaponTabRow(
              'Motion',
              weapon.motion,
              'weapon-stat-border-bottom'
            )}
            ${this.renderWeaponTabRow('Rate of Fire', weapon.rateOfFire)}
            ${this.renderWeaponTabRow('Aiming Time', weapon.aiming)}
            ${this.renderWeaponTabRow('Reload Time', weapon.reload)}
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
    return html`
      <div class="unit-bottom-stats">
        ${this.renderUnitBottomStatsItem('Strength', this.unit?.strength)}
        ${this.renderUnitBottomStatsItem('Optics', this.unit?.optics)}
        ${this.renderUnitBottomStatsItem('Stealth', this.unit?.stealth)}
        ${this.renderUnitBottomStatsItem(
          'Reveal Influence',
          this.unit?.revealInfluence
        )}
        ${this.renderUnitBottomStatsItem('Max Damage', this.unit?.maxDmg)}
        ${this.renderUnitBottomStatsItem('Air Optics', this.unit?.airOptics)}
        ${this.renderUnitBottomStatsItem('ECM', this.unit?.ecm)}
        ${this.renderUnitBottomStatsItem('Agility', this.unit?.agility)}
        ${this.renderUnitBottomStatsItem('Trajectory', this.unit?.trajectory)}
        ${this.renderUnitBottomStatsItem('Speed', this.unit?.speed)}
        ${this.renderUnitBottomStatsItem('Road Speed', this.unit?.roadSpeed)}
        ${this.renderUnitBottomStatsItem('Autonomy', this.unit?.autonomy)}
        ${this.renderUnitBottomStatsItem('Fuel', this.unit?.fuel)}
        ${this.renderUnitBottomStatsItem('Supply Cost', this.unit?.supply)}
        ${this.renderUnitBottomStatsItem('Transport', this.unit?.transport)}
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

  renderWeaponsRow(): TemplateResult {
    return html`
      <vaadin-tabsheet>
        <vaadin-tabs
          theme="equal-width-tabs center"
          slot="tabs"
          @selected-changed="${this.selectedWeaponTabChanged}"
        >
          ${this.renderWeaponTabs()}
        </vaadin-tabs>

        ${this.renderWeaponStats(
          this.unit?.weaponMetadata[this.selectedWeapon] ?? {}
        )}
      </vaadin-tabsheet>
    `;
  }

  render() {
    return html` <div class="unit-card">
      ${this.renderTitleRow()}
      <unit-armor-view .unit=${this.unit}></unit-armor-view>
      ${this.renderWeaponsRow()} ${this.renderUnitBottomStats()}
    </div>`;
  }
}
