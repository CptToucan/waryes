import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import {UnitsDatabaseService} from '../services/units-db';
import {Unit} from '../types/unit';
import '../components/unit-armor-view';
import '@vaadin/tabs';

@customElement('unit-view-route')
export class UnitViewRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .unit-view {
        padding: var(--lumo-space-s);
        max-width: 400px;
      }

      .unit-view > unit-card {
        width: 100%;
      }

      unit-image {
        width: 300px;
      }

      .expanded-unit-card {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        width: 100%;
        margin: var(--lumo-space-s);
        padding: var(--lumo-space-s);
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
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        flex: 1 1 100%;
      }

      individual-weapon-view {
        max-width: 400px;
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
  expert = true;

  @property()
  unitId = 'init';

  @state()
  private unit?: Unit;

  async onBeforeEnter(location: RouterLocation) {
    this.unitId = location.params.unitId as string;
    this.fetchUnit(this.unitId);
  }

  async fetchUnit(unitId: string) {
    const units = await UnitsDatabaseService.fetchUnits();
    this.unit = units?.find((u) => u.descriptorName === unitId);
  }

  render(): TemplateResult {
    if (this.unit) {
      return html`<div class="expanded-unit-card show-on-large-screens">
          <div class="unit-info">
            <unit-card-header-view .unit=${this.unit} .expert=${this.expert} @mode-toggled=${() => this.expert = !this.expert}></unit-card-header-view>
            <div class="unit-image">
              <unit-image .unit=${this.unit}></unit-image>
            </div>
            <unit-armor-view .unit=${this.unit}></unit-armor-view>
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
            <unit-card .showImage=${true} .unit=${this.unit} ?expert=${true}></unit-card>
          </div>
        </div> `;
    }
    return html`NO UNIT`;
  }
}

/*
  render(): TemplateResult {
    return html`
    <div class="unit-image">
      ${this.unit && html`<unit-image .unit=${this.unit}></unit-image>`}
    </div>
    <div class='unit-view'>
      <unit-card .unit=${this.unit} ?expert=${true}></unit-card>
    </div>
    `;
  }
  */
