import {css, html, LitElement, TemplateResult} from 'lit';
import {BeforeEnterObserver} from '@vaadin/router';
import {customElement, state} from 'lit/decorators.js';

import '../components/division-analysis/division-analysis-map';
import '../components/division-analysis/division-analysis-display';

import {
  DivisionAnalysisAdapter,
  DivisionAnalysisDivision,
} from '../classes/DivisionAnalysisAdapter';
import {LoadUnitsAndDivisionsMixin} from '../mixins/load-units-and-divisions';
import {Division} from '../types/deck-builder';
import {DivisionFilterMode} from '../components/filter/division-filter';

export type DivisonAnalysisMap = {
  [key: string]: DivisionAnalysisDivision;
};

@customElement('division-analysis-route')
export class DivisionAnalysisRoute
  extends LoadUnitsAndDivisionsMixin(LitElement)
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-m);
        position: relative;
        height: 100%;
        overflow: hidden;
      }

      .container {
        display: grid;
        grid-template-columns: 40% 60%;
        justify-content: center;
        height: 100%;
        box-sizing: border-box;
        padding: var(--lumo-space-m);
      }

      .division-selection {
        display: flex;
        flex-direction: column;
      }

      button.division-selector {
        border-radius: var(--lumo-border-radius-m);
        padding: var(--lumo-space-xs);
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        align-items: center;
        color: var(--lumo-contrast-80pct);
        border: 2px solid transparent;
        text-overflow: ellipsis;
        overflow-x: hidden;
        overflow-y: hidden;
        white-space: nowrap;
        box-sizing: content-box;
        cursor: pointer;
      }

      button.division-selector span {
        text-overflow: ellipsis;
        overflow-x: hidden;
        white-space: nowrap;
      }

      .map-and-filter {
        margin-right: var(--lumo-space-m);
      }

      button:hover {
        background-color: var(--lumo-contrast-10pct);
      }

      button:focus {
        border: 2px solid var(--lumo-primary-color-50pct);
      }

      .button-content {
        flex: 1 1 100%;
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
        justify-content: space-between;
      }

      .button-content > span {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      button > span {
        display: flex;
        flex: 1 1 0%;
      }

      country-flag {
        margin-right: var(--lumo-space-s);
        max-height: 24px;
        max-width: 24px;
      }

      division-flag {
        margin: 0 var(--lumo-space-s);
        max-height: 24px;
        max-width: 24px;
      }
      summary-view {
        flex: 1 1 100%;
      }

      division-analysis-display {
        overflow: auto;
      }



      .mobile-only {
        display: none;
      }

      @media (max-width: 1000px) {
        .map-and-filter {
          display: none;
        }

        .container {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;

        }

        .mobile-only {
          display: block;
        }

      }


    `;
  }

  divisionAnalysis?: DivisonAnalysisMap;

  availableDivisions: Division[] = [];

  @state()
  selectedDivisionDescriptor?: string;

  get selectedDivision() {
    return this.divisionsMap[this.selectedDivisionDescriptor ?? ''];
  }

  get selectedDivisionAnalysis() {
    return this.divisionAnalysis?.[this.selectedDivisionDescriptor ?? ''];
  }

  async onBeforeEnter(): Promise<void> {
    const response = await DivisionAnalysisAdapter.getPage();
    await this.loadUnitsAndDivisions();

    this.availableDivisions = Object.values(this.divisionsMap).sort(
      alphabeticalCompare
    );

    // Convert divisionAnalysis to a mapped object
    const mappedDivisionAnalysis: DivisonAnalysisMap = {};

    if (response) {
      for (const division of response.data) {
        mappedDivisionAnalysis[division.attributes.DivisionDescriptor] =
          division;
      }
    }
    this.divisionAnalysis = mappedDivisionAnalysis;
  }

  updateSelectedDivision(selectedDivisionDescriptor: string) {
    this.selectedDivisionDescriptor = selectedDivisionDescriptor;
  }

  renderDivisionSelection(): TemplateResult {
    const divisions = [];

    for (const division in this.divisionsMap) {
      divisions.push(this.divisionsMap[division]);
    }

    return html`
      <division-filter
        .mode=${DivisionFilterMode.SINGLE}
        .divisions=${divisions}
        .showLabel=${false}
        .selectedDivisions=${[this.selectedDivision]}
        @division-filter-changed=${(e: CustomEvent) => {
          this.updateSelectedDivision(e.detail.divisions[0]?.descriptor);
        }}
      ></division-filter>
    `;
  }

  render(): TemplateResult {
    return html`
      <div class="container">
        <div class="map-and-filter">
          ${this.renderDivisionSelection()}
          <division-analysis-map
            @division-clicked=${(e: CustomEvent) => {
              this.updateSelectedDivision(e.detail.division);
            }}
            .selectedDivisionDescriptor=${this.selectedDivisionDescriptor}
          ></division-analysis-map>
        </div>
        <div class="mobile-only">${this.renderDivisionSelection()}</div>
        <division-analysis-display
          .divisionAnalysis=${this.selectedDivisionAnalysis}
          .divisionsMap=${this.divisionsMap}
          .unitMap=${this.unitMap}
        ></division-analysis-display>
      </div>
    `;
  }
}

function alphabeticalCompare(a: Division, b: Division) {
  if (a.alliance < b.alliance) {
    return -1;
  }
  if (a.alliance > b.alliance) {
    return 1;
  }
  return 0;
}

declare global {
  interface HTMLElementTagNameMap {
    'division-analysis-route': DivisionAnalysisRoute;
  }
}
