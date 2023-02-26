import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Weapon, Unit} from '../types/unit';
import {TabsSelectedChangedEvent} from '@vaadin/tabs';
import '@vaadin/tabs';

import '../components/e-chart';
import './trait-badge';
import './individual-weapon-view';

@customElement('unit-weapon-view')
export class UnitWeaponView extends LitElement {
  static get styles() {
    return css`
      .weapons-tab {
        width: 100%;
        border-collapse: collapse;
      }

      .weapons-tab {
        display: flex;
        flex-direction: column;
        min-height: 0px;
      }

      vaadin-tab {
        font-size: var(--lumo-font-size-s);
      }

      h5 {
        margin: 0;
        margin-top: var(--lumo-space-xs);
        text-decoration: underline;
      }

      vaadin-tabs [part='tabs'] {
        -webkit-overflow-scrolling: auto !important;
      }
    `;
  }

  @property()
  unit?: Unit;

  @property({type: Boolean})
  expert = false;

  @state()
  private selectedWeapon = 0;

  private selectedWeaponTabChanged(event: TabsSelectedChangedEvent) {
    this.selectedWeapon = event.detail.value;
  }

  renderWeaponTabs(): TemplateResult[] {
    const tabs = (this.unit?.weapons ?? [])
      .filter((w: Weapon) => Object.keys(w).length > 0)
      .map((weapon: Weapon) => {
        return html`<vaadin-tab>${weapon.weaponName}</vaadin-tab>`;
      });

    return tabs;
  }

  renderWeaponStats(weapon: Weapon): TemplateResult {
    return html`
      <div class="weapons-tab">
        <individual-weapon-view .expert=${this.expert} .weapon=${weapon}></individual-weapon-view>
      </div>
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
          style="max-width: 100%;"
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
