import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  UnitMetadata,
  fieldType,
  metadataMap,
  WeaponMetadata
} from '../types';
import {modalController} from '@ionic/core';
import {UnitService} from '../services/unit';
import {convertMetadataArrayToMap} from '../utils/convert-metadata-array-to-map';

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

      .command-points {
        color: var(--ion-color-tertiary);
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
  unit?: UnitMetadata;

  @state()
  selectedTab = 0;

  renderHeader(unit: UnitMetadata): TemplateResult {
    return html`<div class="card-header">
      <h3 class="card-title">${unit.name}</h3>
      <h3 class="command-points">${unit.commandPoints}</h3>
    </div>`;
  }

  /*

        <ion-button fill="clear" @click=${this.openSelected}>
        <ion-icon slot="icon-only" name="stats-chart"></ion-icon>
      </ion-button>
      */

  renderArmor(unit: UnitMetadata, metadataMap: metadataMap): TemplateResult {
    const armorValues = [
      metadataMap.frontArmor,
      metadataMap.sideArmor,
      metadataMap.rearArmor,
      metadataMap.topArmor,
    ];

    const armorTemplateResults: TemplateResult[] = [];

    for (const armor of armorValues) {
      armorTemplateResults.push(
        html`<div class="armor">
          <div class="armor-value">${unit[armor.id as keyof UnitMetadata]}</div>
          <div class="armor-title">${armor.label}</div>
        </div>`
      );
    }
    return html`<div class="card-armor">${armorTemplateResults}</div>`;
  }

  tabChange(event: {detail: {value: string}}): void {
    this.selectedTab = parseInt(event.detail.value);
  }

  renderWeaponTabs(unit: UnitMetadata, metadata: metadataMap): TemplateResult {
    const weaponTemplateResult: TemplateResult[] = [];

    let index = 0;
    for (const weapon of unit.weaponMetadata) {
      if (weapon.name) {
        weaponTemplateResult.push(
          html` <ion-segment-button value=${index}>
            <ion-label>
              <ion-text color="light"> ${weapon.name} </ion-text>
            </ion-label>
          </ion-segment-button>`
        );
      }

      index++;
    }

    const selectedWeapon: WeaponMetadata = unit.weaponMetadata[this.selectedTab];
    let weaponDetailsResult: TemplateResult = html``;

    if (this.selectedTab !== undefined && selectedWeapon) {
      weaponDetailsResult = this.renderWeapon(selectedWeapon, metadata);
    }

    return html`<div class="card-tab-header">
      <ion-segment value=${this.selectedTab} @ionChange=${this.tabChange}>
        ${weaponTemplateResult}
      </ion-segment>
      <div class="tab-content">${weaponDetailsResult}</div>
    </div>`;
  }

  renderWeapon(weapon: WeaponMetadata, weaponFieldMetadata: metadataMap): TemplateResult {
    const layout: AttributeGroup[] = [
      {
        attributes: ['name', 'ammunition'],
      },
      {
        name: 'damage',
        attributes: ['penetration', 'he', 'suppress'],
      },
      {
        name: 'range',
        attributes: ['ground', 'helicopter', 'aircraft'],
      },
      {
        name: 'accuracy',
        attributes: ['static', 'motion'],
      },
      {
        name: 'attributes',
        attributes: ['rateOfFire', 'aiming', 'reload', 'salvoLength'],
      },
      {
        attributes: ['supplyCost'],
      },
    ];

    const weaponLayout: TemplateResult[] = [];

    for (const group of layout) {
      const weaponStatGroup: TemplateResult[] = [];

      for (const attribute of group.attributes) {
        weaponStatGroup.push(html`
          <div class="weapon-stat">
            <div class="weapon-attribute-name">${weaponFieldMetadata[attribute]?.label}</div>
            <div class="weapon-attribute-value">${weapon[attribute as keyof WeaponMetadata]}</div>
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

  renderFooter(unit: UnitMetadata, platoonFieldMetadata: metadataMap): TemplateResult {
    const platoonHtml: TemplateResult[] = [];

    for (const stat in platoonFieldMetadata) {
      platoonHtml.push(html`<div class="platoon-stat">
        <div class="platoon-attribute-name">${platoonFieldMetadata[stat].label}</div>
        <div class="platoon-attribute-value">
          ${unit[stat as keyof UnitMetadata]}
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
      },
    });

    modal.componentProps = {
      ...modal.componentProps,
      parentModal: modal,
    };
    modal.present();
  }

  render() {
    if (this.unit) {
      const staticFields = convertMetadataArrayToMap(
        UnitService.findFieldMetadataByType(fieldType.STATIC)
      );

      const weaponFields = convertMetadataArrayToMap(
        UnitService.findFieldMetadataByType(fieldType.WEAPON)
      );

      const platoonFields = convertMetadataArrayToMap(
        UnitService.findFieldMetadataByType(fieldType.PLATOON)
      )

      return html`
        <div class="card">
          ${this.renderHeader(this.unit)}
          ${this.renderArmor(this.unit, staticFields)}
          ${this.renderWeaponTabs(this.unit, weaponFields)}
          ${this.renderFooter(this.unit, platoonFields)}
        </div>
      `;
    }

    return html`Error loading unit`;
  }
}

/*

            ${this.renderHeader(staticInformation)}
            ${this.renderArmor(staticInformation)}
            ${this.renderWeaponTabs(allWeaponsInformation)}
            ${this.renderFooter(platoonInformation)}

            */
