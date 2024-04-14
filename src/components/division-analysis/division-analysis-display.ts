import {LitElement, html, css, TemplateResult} from 'lit';

import {customElement, property} from 'lit/decorators.js';
import {DivisionAnalysisDivision} from '../../classes/DivisionAnalysisAdapter';
import {DivisionsMap} from '../../types/deck-builder';
import {UnitMap} from '../../types/unit';

import '../unit-image';
import '../division-flag';
import '../country-flag';
import { Router } from '@vaadin/router';

@customElement('division-analysis-display')
export class DivisionAnalysisDisplay extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-m);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p {
        margin: 0;
      }

      ul {
        margin: 0;
      }

      .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .header-group {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--lumo-space-s);
      }

      unit-image {
        overflow: hidden;
        border-radius: var(--lumo-border-radius-m);
        min-width: 100px;
      }

      .important-units {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        flex-wrap: wrap;
      }

      .side-by-side {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-m);
      }

      @media (max-width: 800px) {
        .side-by-side {
          flex-direction: column;
        }
      }

      .side-by-side .section {
        flex: 1;
      }

      .unit-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .unit-container .information {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
      }

      .information h5 {
        margin-bottom: var(--lumo-space-xs);
        text-align: center;
      }

      .section {
        padding: var(--lumo-space-s) var(--lumo-space-s);
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-xs);
      }

      .positive {
        background-color: var(--warno-good-20pct);
      }

      .negative {
        background-color: var(--warno-very-bad-20pct);
      }

      ul {
        list-style-type: none; /* Remove default bullet points */
      }

      ul li {
        margin: var(--lumo-space-xs) 0; /* Add some space between the list items */
      }

      ul.pros li::before {
        content: '+'; /* Insert a plus sign before each list item */
      }

      ul.cons li::before {
        content: '-'; /* Insert a plus sign before each list item */
      }

      .pros {
        // color: #038a37;
      }

      .cons {
        // color: #bb0303;
      }

      ul li::before {
        display: inline-block;
        width: 1em; /* Width of the pseudo-element */
        margin-left: -1em; /* Move the pseudo-element to the left */
      }
    `;
  }

  @property()
  divisionAnalysis?: DivisionAnalysisDivision;

  divisionsMap?: DivisionsMap;
  unitMap?: UnitMap;

  render(): TemplateResult {
    const divisionDescriptor =
      this.divisionAnalysis?.attributes.DivisionDescriptor;

    if (!divisionDescriptor) {
      return html`<div>No division selected</div>`;
    }

    const division = this.divisionsMap?.[divisionDescriptor];

    return html`
      <div class="header">
        <div class="header-group">
          <division-flag .division=${division}></division-flag
          ><country-flag .country=${division?.country}></country-flag>
          <h2>${division?.name || divisionDescriptor}</h2>
        </div>
        <vaadin-button theme="primary" @click=${() => {
          Router.go(`/deck-builder/${divisionDescriptor}`);
        }}>Build this deck</vaadin-button>
      </div>
      <div class="section">
        <h3>Summary</h3>
        ${this.divisionAnalysis?.attributes.DivisionDescription}
      </div>
      <div class="section">
        <h3>History</h3>
        ${this.divisionAnalysis?.attributes.DivisionHistory}
      </div>
      <div class="side-by-side">
        <div class="section positive">
          <h3>Pros</h3>
          <ul class="pros">
            ${this.divisionAnalysis?.attributes.Pros.map((pro) => {
              return html` <li>${pro.Bulletpoint}</li> `;
            })}
          </ul>
        </div>
        <div class="section negative">
          <h3>Cons</h3>
          <ul class="cons">
            ${this.divisionAnalysis?.attributes.Cons.map((con) => {
              return html` <li>${con.Bulletpoint}</li> `;
            })}
          </ul>
        </div>
      </div>

      <div class="section">
        <h3>Units</h3>
        <div class="important-units">
          ${this.divisionAnalysis?.attributes.UnitDescriptors.map(
            (unitDescriptor) => {
              return html`
                <div class="unit-container">
                  <unit-image
                    .unit=${this.unitMap?.[unitDescriptor.DescriptorId]}
                  ></unit-image>
                  <div class="information">
                    <h5>${this.unitMap?.[unitDescriptor.DescriptorId].name}</h5>
                  </div>
                </div>
              `;
            }
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-analysis-display': DivisionAnalysisDisplay;
  }
}
