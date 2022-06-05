import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('waryes-card')
export class WaryesCard extends LitElement {
  static get styles() {
    return css`
      :host {
        overflow: hidden;
        display: block;
        height: 100%;
      }
      .card {
        background-color: var(--ion-panel-background-color);
        border-radius: 5px;
        height: 100%;
      }
    `;
  }

  render() {
    return html`
      <div class="card">
        <slot></slot>
      </div>
    `;
  }
}
