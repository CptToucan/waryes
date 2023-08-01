import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import {Unit} from '../types/unit';
import '../components/unit-armor-view';
import '@vaadin/tabs';
import { BundleManagerService } from '../services/bundle-manager';

@customElement('unit-view-route')
export class UnitViewRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
      :host {
        display: flex;
        padding: var(--lumo-space-s);
      }

      .unit-view {
        // max-width: 400px;
      }

      unit-image {
        width: 300px;
      }

      .border-radius {
        border-radius: var(--lumo-border-radius-m);
        overflow: hidden;
      }

      .expanded-unit-card {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        max-width: 1920px;
        flex: 1 1 100%;
        padding: var(--lumo-space-s);
        border-radius: var(--lumo-border-radius-m);
      }

      .unit-info {
        flex: 1 1 25%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .unit-image {
        display: flex;
        justify-content: center;
      }

      .weapon-info {
        display: flex;
        flex: 1 1 75%;
      }

      .weapon {
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
        flex: 1 1 100%;
        max-width: 400px;
      }

      .weapon:not(:last-child) {
        border-right: 1px solid var(--lumo-contrast-30pct);
      }

      .show-on-small-screens {
        flex: 1 1 0px;
      }

      individual-weapon-view {
        display: block;
      }

      @media only screen and (max-width: 1199px) {
        .show-on-large-screens {
          display: none;
        }
      }

      @media only screen and (min-width: 1200px) {
        .show-on-small-screens {
          display: none;
        }
      }
    `;
  }

  @state()
  expert = false;

  @property()
  unitId = 'init';

  @state()
  private unit?: Unit;

  async onBeforeEnter(location: RouterLocation) {
    this.unitId = location.params.unitId as string;
    this.fetchUnit(this.unitId);
  }

  async fetchUnit(unitId: string) {
    const units = await BundleManagerService.getUnits();
    this.unit = units?.find((u) => u.descriptorName === unitId);
  }

  render(): TemplateResult {
    if (this.unit) {
      return html`<div class="expanded-unit-card show-on-large-screens">
          <div class="unit-info">
            <unit-card-header-view .unit=${this.unit} .expert=${this.expert} @mode-toggled=${() => this.expert = !this.expert}></unit-card-header-view>
            <div class="unit-image">
              <div class="border-radius">
              <unit-image .unit=${this.unit}></unit-image>
              </div>
            </div>
            <unit-armor-view .unit=${this.unit}></unit-armor-view>
            <unit-info-panel-view .unit=${this.unit}></unit-info-panel-view>
          </div>
          <div class="weapon-info">
            ${this.unit.weapons.map(
              (weapon) =>
                html`<div class="weapon">
                  <individual-weapon-view
                    .expert=${this.expert}
                    .weapon=${weapon}
                  ></individual-weapon-view>
                  <div></div>
                </div>`
            )}
          </div>
        </div>

        <div class="show-on-small-screens">
          <div class="unit-view">
            <unit-card .showImage=${true} .unit=${this.unit} ?expert=${false}></unit-card>
          </div>
        </div> `;
    }
    return html`Loading...`;
  }
}
