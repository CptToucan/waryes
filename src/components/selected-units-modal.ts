import {SelectCustomEvent} from '@ionic/core';
import {IonModal} from '@ionic/core/components/ion-modal';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {WarnoUnit, WarnoWeapon} from '../types';

import {
  platoonStats,
  weaponStats,
  staticStats,
  extractUnitInformation,
} from '../utils/extract-unit-information';
import {humanize} from '../utils/humanize';

type SelectedUnitWeapon = {
  unit: WarnoUnit;
  weapons: WarnoWeapon[];
  selectedWeapon: string;
};

enum modalStage {
  WEAPON_SELECT,
  FIELD_SELECT,
}

const NO_WEAPON_SELECTED = 'NONE';

function utf8_to_b64( str: string ): string {
  return window.btoa(unescape(encodeURIComponent( str )));
}



@customElement('selected-units-modal')
export class Unit extends LitElement {
  static get styles() {
    return css`
      ion-toolbar {
        --background: var(--ion-panel-background-color);
        --color: var(--ion-color-secondary);
      }

      :host {
        --color: var(--ion-color-light);
        --ion-text-color: var(--ion-color-light);
      }

      .unit-grid {
        display: flex;
      }

      .unit {
        flex: 1 1 100%;
      }

      .weapon {
        flex: 1 1 100%;
      }

      ion-content.content-padding {
        --padding-start: 8px;
        --padding-end: 8px;
      }

      .error-message {
        color: var(--ion-color-danger);
        padding-left: 8px;
        padding-right: 8px;
        text-align: center;
      }

      .no-weapons-on-units {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        margin-top: -64px;
        color: var(--ion-color-secondary);
        --color: var(--ion-color-secondary);
      }

      .no-weapons-on-units > ion-icon {
        font-size: 140px;
      }

      .no-weapons-on-units > h2 {
        padding-top: 8px;
        font-size: 32px;
        text-align: center;
      }

      .no-weapons-on-units > span {
        font-size: 24px;
        text-align: center;
      }
    `;
  }

  @property()
  parentModal?: IonModal;

  @property()
  selectedUnits: WarnoUnit[] = [];

  @state()
  selectedUnitWeapons?: SelectedUnitWeapon[];

  @state()
  stage: modalStage = modalStage.WEAPON_SELECT;

  @state()
  selectedUnitFieldsToCompare: string[] = [];

  @state()
  selectedWeaponFieldsToCompare: string[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.selectedUnitWeapons = this.selectedUnits.map((unit) => {
      const unitInfo = extractUnitInformation(unit);
      const unitWeapons = unitInfo.allWeaponsInformation.filter(
        (weapon) => weapon.name !== undefined
      );
      return {unit, weapons: unitWeapons, selectedWeapon: NO_WEAPON_SELECTED};
    });
  }

  dismissModal() {
    this.parentModal?.dismiss();
  }

  didSelectUnitField(event: SelectCustomEvent<string[]>) {
    this.selectedUnitFieldsToCompare = event.detail.value;
  }

  didSelectWeaponField(event: SelectCustomEvent<string[]>) {
    this.selectedWeaponFieldsToCompare = event.detail.value;
  }

  selectedWeaponForUnit(
    selectedWeapon: string,
    unitWeapon: SelectedUnitWeapon
  ): void {
    unitWeapon.selectedWeapon = selectedWeapon;
    this.requestUpdate();
  }

  render(): TemplateResult {
    let modalContent: TemplateResult;

    if (this.stage === modalStage.WEAPON_SELECT) {
      modalContent = this.renderWeaponSelection(modalStage.FIELD_SELECT);
    } else {
      modalContent = this.renderFieldSelection();
    }

    return html`<ion-header>
        <ion-toolbar>
          <ion-title><ion-text color="secondary">Compare</ion-text></ion-title>
          <ion-buttons slot="primary">
            <ion-button @click=${this.dismissModal}>
              <ion-icon slot="icon-only" name="close"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="content-padding"> ${modalContent} </ion-content>`;
  }

  renderWeaponSelection(nextStage: modalStage): TemplateResult {
    let errorMessage: string | null = null;

    if (this.selectedUnitWeapons && this.selectedUnitWeapons.length > 0) {
      let canProceed = true;
      let canSelectWeapons = true;

      const noWeaponSelectedUnits = this.selectedUnitWeapons.filter(
        (unitWeapon) => {
          return unitWeapon.selectedWeapon === NO_WEAPON_SELECTED;
        }
      );

      for (const unitWeapon of this.selectedUnitWeapons) {
        if (unitWeapon.weapons.length === 0) {
          canSelectWeapons = false;
        }
      }

      if (
        noWeaponSelectedUnits.length < this.selectedUnitWeapons.length &&
        noWeaponSelectedUnits.length !== 0
      ) {
        canProceed = false;
        errorMessage =
          'All units must have a weapon selected, or no units can have one selected';
      }

      let weaponSelectBody: TemplateResult;
      if (canSelectWeapons) {
        weaponSelectBody = html`<ion-list style="margin-bottom: 128px;">
          <ion-list-header slot="header"
            >Select fields to compare</ion-list-header
          >
          ${this.selectedUnitWeapons.map((unitWeapon) => {
            return html`<ion-list-header
                ><div style="color: var(--ion-color-secondary)">
                  ${unitWeapon.unit.name}
                </div>
              </ion-list-header>
              <ion-item>
                <ion-select
                  id="static-fields"
                  class="select-override"
                  cancel-text="Cancel"
                  ok-text="Confirm"
                  placeholder="Weapon"
                  value=${unitWeapon.selectedWeapon}
                  @ionChange=${(event: SelectCustomEvent<string>) =>
                    this.selectedWeaponForUnit(event.detail.value, unitWeapon)}
                >
                  ${unitWeapon.weapons.map(
                    (el) =>
                      html`<ion-select-option value=${el.weaponId}>
                        ${el.type}</ion-select-option
                      >`
                  )}
                  <ion-select-option value=${NO_WEAPON_SELECTED}>
                    ${NO_WEAPON_SELECTED}</ion-select-option
                  >
                </ion-select>
              </ion-item> `;
          })}
        </ion-list> `;
      } else {
        weaponSelectBody = html` <div class="no-weapons-on-units">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <h2>Weapon selection disabled</h2>
          <span>
            To enable weapon selection, all selected units must have weapons
          </span>
        </div>`;
      }

      return html`
        ${weaponSelectBody}
        <div slot="fixed" style="bottom: 8px; left: 8px; right: 8px;">
          ${errorMessage ? this.renderErrorMessage(errorMessage) : html``}
          <ion-button
            size="large"
            expand="block"
            ?disabled=${!canProceed}
            @click=${() => {
              this.setStage(nextStage);
            }}
            >Next</ion-button
          >
        </div>
      `;
    }

    return html`Error rendering units`;
  }

  renderFieldSelection(): TemplateResult {
    if (this.selectedUnitWeapons && this.selectedUnitWeapons.length > 0) {
      let canCompare = false;

      if (
        this.selectedUnitFieldsToCompare.length > 0 ||
        this.selectedUnitFieldsToCompare.length > 0
      ) {
        canCompare = true;
      }

      const canSelectUnitFields = true;
      let canSelectWeaponFields = true;

      const unitsWithWeaponSelected = this.selectedUnitWeapons.filter(
        (unit) => {
          return unit.selectedWeapon !== NO_WEAPON_SELECTED;
        }
      );

      if (
        unitsWithWeaponSelected.length !== this.selectedUnitWeapons.length ||
        unitsWithWeaponSelected.length === 0
      ) {
        canSelectWeaponFields = false;
      }

      const queryParams = utf8_to_b64(JSON.stringify({
          unitFields: this.selectedUnitFieldsToCompare,
          weaponFields: this.selectedWeaponFieldsToCompare,
          selectedUnitWeapons: this.selectedUnitWeapons.map((unitWeapon) => {
            return {id: unitWeapon.unit.id, weapon: unitWeapon.selectedWeapon};
          }),
        }));

      return html`
        <ion-list>
          <ion-list-header slot="header"
            >Select fields to compare</ion-list-header
          >
          <ion-item>
            <ion-label
              ><div style="color: var(--ion-color-secondary)">
                Unit Fields
              </div></ion-label
            >
            <ion-select
              id="static-fields"
              class="select-override"
              multiple="true"
              cancel-text="Cancel"
              ok-text="Confirm"
              ?disabled=${!canSelectUnitFields}
              @ionChange=${this.didSelectUnitField}
            >
              ${[...staticStats, ...platoonStats].map(
                (el) =>
                  html`<ion-select-option value=${el}
                    >${humanize(el)}</ion-select-option
                  >`
              )}
            </ion-select>
          </ion-item>
          <ion-item-divider></ion-item-divider>
          <ion-item>
            <ion-label
              ><div style="color: var(--ion-color-secondary)">
                Weapon Fields
              </div>
            </ion-label>
            <ion-select
              class="select-override"
              ?multiple=${true}
              cancel-text="Cancel"
              ok-text="Confirm"
              ?disabled=${!canSelectWeaponFields}
              @ionChange=${this.didSelectWeaponField}
            >
              ${weaponStats
                .filter((el) => el !== 'type' && el !== 'name')
                .map(
                  (el) =>
                    html`<ion-select-option value=${el}
                      >${humanize(el)}</ion-select-option
                    >`
                )}
            </ion-select>
          </ion-item>
        </ion-list>

        <div slot="fixed" style="bottom: 8px; left: 8px; right: 8px;">
          <ion-button
            size="large"
            expand="block"
            ?disabled=${!canCompare}
            href="/workspace?${queryParams}"
          >
            Compare
          </ion-button>
        </div>
      `;
    }
    return this.renderErrorMessage('Error rendering field selection');
  }

  setStage(stage: modalStage) {
    this.stage = stage;
  }

  /**
   * Renders an error message
   * @param errorMessage
   */
  renderErrorMessage(errorMessage: string): TemplateResult {
    return html` <div class="error-message">${errorMessage}</div>`;
  }
}
