import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export interface Map {
  name: string;
  mode: string;
  size: string;
  image: string;
}

@customElement('warno-map')
export class WarnoMap extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
      }

      h2,
      h3 {
        margin: 0;
      }

      .map-container {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-m);
        width: 100%;
      }

      .title {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-bottom: var(--lumo-space-s);
        gap: var(--lumo-space-s);
      }

      .image {
        width: 100%;
      }

      img {
        width: 100%;
      }
    `;
  }

  @property()
  map?: Map;

  render(): TemplateResult {
    return html`
      <div class="map-container">
        <div class="title">
          <h2>${this.map?.name}</h2>
          <h3>${this.map?.mode}</h3>
          <h3>${this.map?.size}</h3>
        </div>
        <div class="image">
          <img src="${this.map?.image}" />
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'warno-map': WarnoMap;
  }
}