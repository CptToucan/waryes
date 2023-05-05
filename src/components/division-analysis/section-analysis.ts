import {
  LitElement,
  html,
  css,
  customElement,
  property,
  state,
} from 'lit-element';
import {UnitAnalysisGroup} from './division-analysis';
import './progress-bar';
import {humanize} from '../../utils/humanize';

@customElement('section-analysis')
export class SectionAnalysis extends LitElement {
  static get styles() {
    return css`
      h2,
      h3,
      h6 {
        margin: 0;
      }

      .analysis-section {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-s);
      }

      .analysis-title-section,
      .analysis-sub-section {
        display: flex;
        gap: var(--lumo-space-m);
        align-items: flex-end;
      }

      .expandable {
        transition: max-height 0.3s ease-out;
        max-height: 0;
        overflow: hidden;
      }

      .expandable.opened {
        max-height: 150px;
      }

      .analysis-sub-section progress-bar {
        height: 8px;
      }

      .analysis-sub-section .headline-value {
        font-size: var(--lumo-font-size-s);
      }

      .analysis-section vaadin-icon {
        width: 48px;
        height: 48px;
      }

      .analysis-section .progress-bar-container {
        flex-grow: 1;
      }

      .headline-value {
        font-size: var(--lumo-font-size-xl);
        font-weight: 600;
      }

      button {
        display: inline-block;
        border: none;
        margin: 0;
        padding: 0;
        font: inherit;
        color: inherit;
        background-color: transparent;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        position: relative;
      }

      button {
        height: 56px;
        width: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      button.open:hover::after {
        content: '-';
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: var(--lumo-font-size-xl);
      }

      button:hover::after {
        content: '+';
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: var(--lumo-font-size-xl);
      }
    `;
  }

  @property()
  analysis?: UnitAnalysisGroup;

  @property()
  icon?: string;

  @state()
  opened = false;

  @property()
  sectionTitle?: string;

  render() {
    if (!this.analysis) {
      return html``;
    }

    let averageValue = 0;

    for (const [, value] of Object.entries(this.analysis)) {
      averageValue += value;
    }

    averageValue = averageValue / Object.keys(this.analysis).length;

    // fix average value to 0.5 increments and show with 1 decimal place

    const averageDisplay = (Math.round(averageValue * 2) / 2).toFixed(1);

    return html`<div class="analysis-section">
      <div class="analysis-title-section">
        <button
          aria-label="Expand section"
          class="${this.opened ? 'open' : ''}"
          @click=${() => (this.opened = !this.opened)}
        >
          <vaadin-icon icon="${this.icon}"></vaadin-icon>
        </button>

        <div class="progress-bar-container">
          <h3>${this.sectionTitle}</h3>
          <progress-bar .percent="${averageValue * 10}"></progress-bar>
        </div>
        <div class="headline-value">${averageDisplay}</div>
      </div>

      <div class="expandable ${this.opened ? 'opened' : ''}">
        ${Object.entries(this.analysis).map(
          ([key, value]) => html`<div class="analysis-sub-section">
            <div class="progress-bar-container">
              <h6>${humanize(key)}</h6>
              <progress-bar .percent="${value * 10}"></progress-bar>
            </div>
            <div class="headline-value">${value}</div>
          </div>`
        )}
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'section-analysis': SectionAnalysis;
  }
}
