import { BeforeEnterObserver, RouterLocation } from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import { UnitsDatabaseService } from '../services/units-db';
import { Unit } from '../types/unit';
import '../components/unit-armor-view';
import '@vaadin/tabs';

@customElement('unit-view-route')
export class UnitViewRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
       
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
    this.unit = units?.find((u) => u.descriptorName === unitId);
  }

  render(): TemplateResult {
    return html`
    <div class='unit-view'>
      <div style="width: 100%; display: flex; justify-content: center">
        <img height="86" src=${WaryesImage} />
      </div>
      <unit-card .unit=${this.unit}></unit-card>
    </div>
    `;
  }

}
