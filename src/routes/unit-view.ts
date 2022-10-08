import { BeforeEnterObserver, RouterLocation } from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import { UnitsDatabaseService } from '../services/units-db';
import { Unit, WeaponMetaData } from '../types/unit';
import '../components/unit-armor-view';
import '@vaadin/tabs';

@customElement('unit-view-route')
export class UnitViewRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
        div.unit-card {
            background-color: var(--lumo-contrast-5pct);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-radius: var(--lumo-border-radius-m);
            padding: var(--lumo-space-l);
        }

        div.unit-view {
            padding: var(--lumo-space-m);
        }
    
        @media(min-width:  1440px) {
            div.unit-card {
                width: 45%;
            }
        }

        @media(min-width: 1024px) {
            div.unit-view {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
        }

        div.unit-title {
            display: flex;
            flex-direction: 'column';
            width: 100%;
        }

        div.unit-title > p { 
            flex-grow: 1;
            font-size: var(--lumo-font-size-xl);
        }

        div.unit-title p.unit-command-points {
            text-align: right;
            color: var(--lumo-primary-text-color);
        }

        vaadin-tabsheet {
            width: 100%;
        }

        .weapons-tab table {
            width: 100%;
            border-collapse: collapse;
        }

        .weapons-tab table td {
            padding: var(--lumo-space-s) 0;
        }

        .weapons-tab table td:nth-child(2) {
            text-align: right;
        }

        .weapons-tab table tr.weapon-stat-border-bottom td {
            border-bottom: 1px solid var(--lumo-primary-color-10pct);
        }

        .unit-bottom-stats {
            margin-top: var(--lumo-space-l);
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

        .unit-bottom-stats div p:nth-child(2) {
            text-align: right;
        }
    `;
  }

  @property() 
  unitId = "init";

  @state()
  private unit?: Unit;

  async onBeforeEnter(location: RouterLocation) {
    this.unitId = location.params.unitId as string;
    this.fetchUnit(this.unitId);
  }

  async fetchUnit(unitId: string) {
    const units = await UnitsDatabaseService.fetchUnits();
    this.unit = units?.find((u) => u.id === unitId);
  }

  render(): TemplateResult {
    return html`
    <div class='unit-view'>
      <div style="width: 100%; display: flex; justify-content: center">
        <img height="86" src=${WaryesImage} />
      </div>
      
      <div class='unit-card'>
        ${ this.renderTitleRow() }
        <unit-armor-view .unit=${ this.unit }></unit-armor-view>
        ${ this.renderWeaponsRow() }
        ${ this.renderUnitBottomStats() }
      </div>
    </div>
    `;
  }

  renderTitleRow(): TemplateResult {
    return html`
    <div class='unit-title'>
        <p class='unit-name'>${this.unit?._name}</p>
        <p class='unit-command-points'>${this.unit?.commandPoints}</p>
    </div>`;
  }

  @state()
    private selectedWeapon = 0;

  renderWeaponsRow(): TemplateResult {
    return html`
    <vaadin-tabsheet>
        <vaadin-tabs theme="equal-width-tabs center" slot="tabs" @selected-changed="${ this.selectedWeaponTabChanged }">
            ${ this.renderWeaponTabs() }
        </vaadin-tabs>

        ${ this.renderWeaponTab(this.unit?.weaponMetadata[this.selectedWeapon] ?? {}) }
    </vaadin-tabsheet>
    `;
  }

  private selectedWeaponTabChanged(event: any) {
    this.selectedWeapon = event.detail.value;
  }

  renderWeaponTabs(): TemplateResult[] {
    const tabs = (this.unit?.weaponMetadata ?? []).filter((w) => Object.keys(w).length > 0).map((weapon) => {
        return html`<vaadin-tab>${weapon.name}</vaadin-tab>`
    })

    return tabs;
  }

  renderWeaponTab(weapon: WeaponMetaData): TemplateResult {
    return html`
        <div class='weapons-tab'>
            <table>
                <tbody>
                    ${ this.renderWeaponTabRow('Name', weapon.name) }
                    ${ this.renderWeaponTabRow('Ammunition', weapon.ammunition, 'weapon-stat-border-bottom' ) }
                    ${ this.renderWeaponTabRow('Penetration', weapon.penetration ) }
                    ${ this.renderWeaponTabRow('HE', weapon.he ) }
                    ${ this.renderWeaponTabRow('Suppress', weapon.suppress, 'weapon-stat-border-bottom'  ) }
                    ${ this.renderWeaponTabRow('Ground Range', weapon.ground ) }
                    ${ this.renderWeaponTabRow('Helicopter Range', weapon.helicopter ) }
                    ${ this.renderWeaponTabRow('Aircraft Range', weapon.aircraft, 'weapon-stat-border-bottom'  ) }
                    ${ this.renderWeaponTabRow('Static Accuracy', weapon.static ) }
                    ${ this.renderWeaponTabRow('Motion Accuracy', weapon.motion, 'weapon-stat-border-bottom'  ) }
                    ${ this.renderWeaponTabRow('Rate of Fire', weapon.rateOfFire ) }
                    ${ this.renderWeaponTabRow('Aiming Time', weapon.aiming ) }
                    ${ this.renderWeaponTabRow('Reload Time', weapon.reload ) }
                    ${ this.renderWeaponTabRow('Salvo Length', weapon.salvoLength, 'weapon-stat-border-bottom'  ) }
                    ${ this.renderWeaponTabRow('Supply Cost', weapon.supplyCost ) }
                </tbody>
            </table>
        </div>
    `;
  }

  renderWeaponTabRow(name: string, value: any, className?: string): TemplateResult {
    return html`
        <tr class='weapons-tab-row ${className}'>
            <td>${name}</td>
            <td>${value}</td>
        </tr>
    `;
  }

  renderUnitBottomStats(): TemplateResult {

    return html`
        <div class='unit-bottom-stats'>
            ${ this.renderUnitBottomStatsItem('Strength', this.unit?.strength) }
            ${ this.renderUnitBottomStatsItem('Optics', this.unit?.optics) }
            ${ this.renderUnitBottomStatsItem('Stealth', this.unit?.stealth) }
            ${ this.renderUnitBottomStatsItem('Reveal Influence', this.unit?.revealInfluence) }
            ${ this.renderUnitBottomStatsItem('Max Damage', this.unit?.maxDmg) }
            ${ this.renderUnitBottomStatsItem('Air Optics', this.unit?.airOptics) }
            ${ this.renderUnitBottomStatsItem('ECM', this.unit?.ecm) }
            ${ this.renderUnitBottomStatsItem('Agility', this.unit?.agility) }
            ${ this.renderUnitBottomStatsItem('Trajectory', this.unit?.trajectory) }
            ${ this.renderUnitBottomStatsItem('Speed', this.unit?.speed) }
            ${ this.renderUnitBottomStatsItem('Road Speed', this.unit?.roadSpeed) }
            ${ this.renderUnitBottomStatsItem('Autonomy', this.unit?.autonomy) }
            ${ this.renderUnitBottomStatsItem('Fuel', this.unit?.fuel) }
            ${ this.renderUnitBottomStatsItem('Supply Cost', this.unit?.supply) }
            ${ this.renderUnitBottomStatsItem('Transport', this.unit?.transport) }
        </div>
    `
  }

  renderUnitBottomStatsItem(name: string, value: any) {
    return html`
    <div>
        <p>${name}</p>
        <p>${value}</p>
    </div>
    `;
  }
}
