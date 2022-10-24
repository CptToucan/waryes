import {css, html, LitElement, TemplateResult, render} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/button';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import {GridColumn, GridItemModel} from '@vaadin/grid';
import {UnitsDatabaseService} from '../services/units-db';
import {Unit} from '../types/unit';
import {router} from '../services/router';

const unitTemplate: Unit = {
  descriptorName: '',
  frontArmor: 0,
  sideArmor: 0,
  rearArmor: 0,
  topArmor: 0,
  maxDamage: 0,
  speed: 0,
  roadSpeed: 0,
  optics: 0,
  airOptics: 0,
  stealth: 0,
  advancedDeployment: 0,
  fuel: 0,
  fuelMove: 0,
  supply: 0,
  ecm: 0,
  agility: 0,
  travelTime: 0,
  weapons: [],
};

@customElement('units-table')
export class UnitsTable extends LitElement {
  static get styles() {
    return css`
      vaadin-grid-cell-content vaadin-grid-sorter {
        color: var(--lumo-primary-color);
      }

      vaadin-grid-cell-content {
        color: white;
      }

      vaadin-grid-cell-content a {
        color: var(--lumo-body-text-color);
      }

      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 0;
      }
    `;
  }

  linkCellRenderer(
    root: HTMLElement,
    _: GridColumn,
    model: GridItemModel<Unit>
  ) {
    return render(
      html`<a
        style="width: 200px; overflow: hidden;"
        href=${router.urlForPath('/unit/:unitId', {
          unitId: model.item.descriptorName,
        })}
        >${model.item.descriptorName}</a
      >`,
      root
    );
  }

  columns() {
    const _columns: TemplateResult[] = [];

    _columns.push(
      html`<vaadin-grid-sort-column
        path=${'descriptorName'}
        width="15em"
        frozen
        resizable
        .renderer=${this.linkCellRenderer}
      ></vaadin-grid-sort-column>`
    );

    for (const key in unitTemplate) {
      if (key !== 'weapons' && key !== 'descriptorName') {
        _columns.push(
          html`<vaadin-grid-sort-column
            path=${key}
            resizable
          ></vaadin-grid-sort-column>`
        );
      }
    }
    return _columns;
  }

  @state()
  private units: Unit[] = [];

  async fetchUnits() {
    const units = await UnitsDatabaseService.fetchUnits();
    this.units = units ?? [];
  }

  async firstUpdated() {
    await this.fetchUnits();
  }

  render(): TemplateResult {
    return html`
      <vaadin-grid .items="${this.units}"> ${this.columns()} </vaadin-grid>
    `;
  }
}
