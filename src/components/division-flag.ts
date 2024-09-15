import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Division } from '../types/deck-builder';

@customElement('division-flag')
export class DivisionFlag extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      img {
        width: 100%;
        overflow: hidden;
      }
    `;
  }

  @property()
  division?: Division

  @property()
  divisionId?: string

  render(): TemplateResult {
    let displayName;
    if (this.divisionId) {
      const divisionId = this.divisionId;
      displayName = divisionId;
    }

    if (this.division) {
      displayName = this.division?.name ?? this.division?.descriptor ?? 'invalid division'
    }

    return html`<img src="/divisions/${this.division?.descriptor || this.divisionId}.png" alt=${displayName} title=${displayName} />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-flag': DivisionFlag;
  }
}
