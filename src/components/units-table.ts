import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/button';
import '@vaadin/grid';
import { UnitsDatabaseService } from '../services/units-db';
import { Unit } from "../types/unit";
import { columnBodyRenderer, GridColumnBodyLitRenderer } from '@vaadin/grid/lit';
import { Router } from '@vaadin/router';

@customElement('units-table')
export class UnitsTable extends LitElement {
  static get styles() {
    return css``;
  }

  @state()
  private units: Unit[] = [];

  async fetchUnits() {
    const units = await UnitsDatabaseService.fetchUnits();
    this.units = units ?? [];
  }

  constructor() {
    super();
    this.fetchUnits();
  }

  render(): TemplateResult {
    return html`
      <div style="width: 100%; display: flex; justify-content: center">
        <vaadin-grid .items="${this.units}">
            <vaadin-grid-column path="descriptorName"></vaadin-grid-column>
            <vaadin-grid-column
              header=""
              ${columnBodyRenderer(this.viewColumnRenderer, [])}
            ></vaadin-grid-column>
        </vaadin-grid>
      </div>
    `;
  }
  
  private viewColumnRenderer: GridColumnBodyLitRenderer<Unit> = (unit: Unit) => html`
      <div>
        <vaadin-button
          @click=${()=> Router.go('/unit/' + unit.descriptorName)}
        >View</vaadin-button>
      </div>
    `
}

