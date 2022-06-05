import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {WarnoStatic, WarnoWeapon, WarnoPlatoon, WarnoUnit} from '../types';
import {humanize} from '../utils/humanize';
import {modalController} from '@ionic/core';
import { extractUnitInformation, platoonStats } from "../utils/extract-unit-information";

type AttributeGroup = {
  name?: string;
  attributes: string[];
};

@customElement('unit-details-card')
export class Unit extends LitElement {
  static get styles() {
    return css`
      :host {
        overflow: hidden;
        display: block;
        height: 100%;
      }
      .card {
        background-color: var(--ion-panel-background-color);
        border-radius: 5px;
        padding-left: 8px;
        padding-right: 8px;
        max-width: 512px;
        height: 100%;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-title {
        color: var(--ion-color-secondary);
        display: flex;
      }

      ion-segment-button {
        --color: var(--ion-color-light);
      }

      .card-armor {
        display: flex;
        justify-content: space-evenly;
      }

      .armor {
        display: flex;
        flex-direction: column;
      }

      .armor-value,
      .armor-title {
        text-align: center;
      }

      .armor-value {
        color: var(--ion-color-light);
        font-size: 32px;
        font-weight: bold;
      }

      .armor-title {
        color: var(--ion-color-medium);
        font-size: 14px;
      }

      .tab-content {
        background-color: var(--ion-panel-background-color) !important;
      }

      ion-label {
        --color: var(--ion-color-light) !important;
      }

      ion-icon {
        color: var(--ion-color-tertiary);
      }

      ion-button {
        height: 16px;
        --padding-start: 4px;
        --padding-end: 4px;
      }

      .weapon-stats {
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .weapon-stat-group {
        display: flex;
        flex-direction: column;
      }

      .weapon-stat-group:not(:last-child) {
        border-bottom: 1px solid var(--ion-color-primary-shade);
      }

      .weapon-stat {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        color: var(--ion-color-light);
        padding-top: 4px;
        padding-bottom: 4px;
      }
      .weapon-attribute-name {
        display: flex;
        align-items: center;
      }

      .platoon-stats {
        display: flex;
        flex-wrap: wrap;
        color: var(--ion-color-light);
        padding-top: 8px;
        padding-bottom: 8px;
        font-size: 14px;
      }

      .platoon-stat {
        display: flex;
        justify-content: space-between;
        flex: 1 1 calc(50% - 8px);
        max-width: calc(50% - 8px);
        padding-left: 4px;
        padding-right: 4px;
      }

      .platoon-attribute-name {
        max-width: 75%;
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .platoon-attribute-value {
      }
    `;
  }

  @property()
  unit?: WarnoUnit;

  @state()
  selectedTab = '';

  renderHeader(staticInfo: WarnoStatic): TemplateResult {
    return html`<div class="card-header">
      <h3 class="card-title">${staticInfo.name}</h3>
      <ion-button fill="clear" @click=${this.openSelected}>
        <ion-icon slot="icon-only" name="stats-chart"></ion-icon>
      </ion-button>
    </div>`;
  }

  renderArmor(staticInfo: WarnoStatic): TemplateResult {
    const armorValues = [
      {id: 'frontArmor', display: 'Front'},
      {id: 'sideArmor', display: 'Side'},
      {id: 'rearArmor', display: 'Rear'},
      {id: 'topArmor', display: 'Top'},
    ];

    const armorTemplateResults: TemplateResult[] = [];

    for (const armor of armorValues) {
      armorTemplateResults.push(
        html`<div class="armor">
          <div class="armor-value">${staticInfo[armor.id]}</div>
          <div class="armor-title">${armor.display}</div>
        </div>`
      );
    }
    return html`<div class="card-armor">${armorTemplateResults}</div>`;
  }

  tabChange(event: { detail: { value: string; }; }): void {
    this.selectedTab = event.detail.value;
  }

  renderWeaponTabs(weapons: WarnoWeapon[]): TemplateResult {
    const weaponTemplateResult: TemplateResult[] = [];

    if (this.selectedTab === '') {
      this.selectedTab = weapons[0]?.name;
    }

    for (const weapon of weapons) {
      if(weapon.name) {
        weaponTemplateResult.push(
          html` <ion-segment-button value=${weapon.name}>
            <ion-label>
              <ion-text color="light"> ${weapon.name} </ion-text>
            </ion-label>
          </ion-segment-button>`
        );
      }

    }

    const selectedWeapon: WarnoWeapon | undefined = weapons.find(
      (element) => this.selectedTab === element.name
    );
    let weaponDetailsResult: TemplateResult = html``;

    if (this.selectedTab !== undefined && selectedWeapon) {
      weaponDetailsResult = this.renderWeapon(selectedWeapon);
    }

    return html`<div class="card-tab-header">
      <ion-segment value=${this.selectedTab} @ionChange=${this.tabChange}>
        ${weaponTemplateResult}
      </ion-segment>
      <div class="tab-content">${weaponDetailsResult}</div>
    </div>`;
  }

  renderWeapon(weapon: WarnoWeapon): TemplateResult {
    const layout: AttributeGroup[] = [
      {
        attributes: ['name'],
      },
      {
        name: 'damage',
        attributes: ['penetration', 'he', 'suppress'],
      },
      {
        name: 'range',
        attributes: ['ground', 'helicopter', 'plane'],
      },
      {
        name: 'accuracy',
        attributes: ['static', 'motion'],
      },
      {
        name: 'attributes',
        attributes: ['rateOfFire', 'aimingTime', 'reloadTime', 'salvoLength'],
      },
      {
        attributes: ['supplyCost'],
      },
    ];

    const weaponLayout: TemplateResult[] = [html``];

    for (const group of layout) {
      const weaponStatGroup: TemplateResult[] = [];

      for (const attribute of group.attributes) {
        weaponStatGroup.push(html`
          <div class="weapon-stat">
            <div class="weapon-attribute-name">${humanize(attribute)}</div>
            <div class="weapon-attribute-value">${weapon[attribute]}</div>
          </div>
        `);
      }

      const groupLayout = html` <div class="weapon-stat-group">
        ${weaponStatGroup}
      </div>`;

      weaponLayout.push(groupLayout);
    }

    return html`<div class="weapon-stats">${weaponLayout}</div>`;
  }

  renderFooter(platoonInfo: WarnoPlatoon): TemplateResult {
    const platoonHtml: TemplateResult[] = [];

    for (const stat of platoonStats) {
      platoonHtml.push(html`<div class="platoon-stat">
        <div class="platoon-attribute-name">${humanize(stat)}</div>
        <div class="platoon-attribute-value">
          ${platoonInfo[stat] ? platoonInfo[stat] : 'N/A'}
        </div>
      </div>`);
    }

    return html`<div class="platoon-stats">${platoonHtml}</div>`;
  }

  async openSelected() {
    const modal = await modalController.create({
      component: 'selected-units-modal',
      componentProps: {
        selectedUnits: [this.unit],
      }
    });

    modal.componentProps = {
      ...modal.componentProps,
      parentModal: modal
    };
    modal.present();
  }

  render() {

    if(this.unit) {
      const {
        staticInformation,
        allWeaponsInformation,
        platoonInformation,
      }: {
        staticInformation: WarnoStatic;
        allWeaponsInformation: WarnoWeapon[];
        platoonInformation: WarnoPlatoon;
      } = extractUnitInformation(this.unit);
  
  
      if (this.unit) {
        return html`
          <div class="card">
            ${this.renderHeader(staticInformation)}
            ${this.renderArmor(staticInformation)}
            ${this.renderWeaponTabs(allWeaponsInformation)}
            ${this.renderFooter(platoonInformation)}
          </div>
        `;
      }
    }

    return html`Error loading unit`;
  }
}
