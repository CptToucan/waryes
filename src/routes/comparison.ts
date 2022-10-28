import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';



@customElement('comparison-route')
export class ComparisonRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: center;
        padding: var(--lumo-space-l);
      }

    `;
  }

  

  render(): TemplateResult {
    return html`
      <div class="page">
        Comparison
      </div>
    `;
  }
}
