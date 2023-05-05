import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../components/division-analysis/division-analysis';

@customElement('division-analysis-route')
export class DivisionAnalysisRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: center;
        padding: var(--lumo-space-s);
      }

      .page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 300px;
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-m);
        border-radius: var(--lumo-border-radius);
        gap: var(--lumo-space-m);
      }
    `;
  }

  render(): TemplateResult {
    return html`
      <div class="page">
        <division-analysis></division-analysis>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-analysis-route': DivisionAnalysisRoute;
  }
}
