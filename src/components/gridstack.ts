import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {GridStack} from 'gridstack';
import 'gridstack/dist/h5/gridstack-dd-native';
import {Dashboard, DashboardType, UnitMetadata} from '../types';
import {animate} from '@lit-labs/motion';

@customElement('gridstack-dashboard')
export class GridstackDashboard extends LitElement {
  static get styles() {
    return css`
      .grid-stack-content {
        height: 100%;
      }
    `;
  }

  protected createRenderRoot() {
    return this;
  }

  @property()
  dashboard: Dashboard[] = [];

  firstUpdated() {
    setTimeout(() => {
      const grid = GridStack.init({
        disableResize: true,
        marginTop: 16,
        marginRight: 16,
        marginLeft: 16,
        marginBottom: 16,
      });
      grid.cellHeight(740);
    }, 0);

    setTimeout(() => {
      const elements = document
        .querySelectorAll('unit-details-card')
        elements.forEach(el => el.classList.add('v-display'))
    }, 100);

    setTimeout(() => {
      const elements = document
        .querySelectorAll('waryes-card')
        elements.forEach(el => el.classList.add('v-display'))
    }, 100);
  }

  render(): TemplateResult {
    return html` <div style="height: 100vh; overflow-y: auto;">
      <div class="grid-stack">
        ${this.dashboard.map((dashboard) => {
          return html`<div class="grid-stack-item" gs-w=${dashboard.type === DashboardType.CHART ? "6" : "3"} gs-h="auto">
            <div class="grid-stack-content">
              ${this.renderDashboardItem(dashboard)}
            </div>
          </div>`;
        })}
      </div>
    </div>`;
  }

  renderDashboardItem(dashboard: Dashboard): TemplateResult {
    if (dashboard.type === DashboardType.UNIT) {
      return html`<unit-details-card
        .unit=${dashboard.data as UnitMetadata}
        class="v-fade v-hidden"
        ${animate()}
      ></unit-details-card>`;
    } else if (dashboard.type === DashboardType.CHART) {
      return html`<waryes-card class="v-fade v-hidden" style="height: 100%;"
        ><e-chart .options=${dashboard.data as echarts.EChartsOption}></e-chart
      ></waryes-card>`;
    }

    return html`${dashboard}`;
  }
}
