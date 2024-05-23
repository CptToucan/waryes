import {html, LitElement, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {LivePool} from '../../types/PickBanTypes';

@customElement('pick-ban-map-pool')
class PickBanMapPool extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        width: 100%;
        box-sizing: border-box;
        justify-content: center;
      }

      /* undo the default button styles */
      button {
        background: none repeat scroll 0 0 transparent;
        border: medium none;
        border-spacing: 0;
        font-size: 16px;
        font-weight: normal;
        margin: 0;
        padding: 0;
        text-align: left;
        text-decoration: none;
        text-indent: 0;
        font-family: var(--lumo-font-family);
      }

      h3 {
        font-size: var(--lumo-font-size-l);
        margin: 0;
      }

      .card {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-s);
        padding: var(--lumo-space-s);
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        max-width: 800px;
        flex: 1 1 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .maps {
        display: flex;

        gap: var(--lumo-space-xs);
      }

      .map-choice {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: var(--lumo-space-xs);
        padding: var(--lumo-space-xs);
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        overflow: hidden;
        cursor: pointer;
      }

      .map-choice[disabled] {
        opacity: 0.3;
        cursor: default;
      }

      .map-choice:hover {
        background-color: var(--lumo-contrast-10pct);
      }

      .map-choice[disabled]:hover {
        background-color: var(--lumo-contrast-5pct);
      }

      .map-choice:focus {
        outline: 1px solid var(--lumo-primary-color-50pct);
        background-color: var(--lumo-contrast-10pct);
      }

      .map-choice:active {
        background-color: var(--lumo-contrast-20pct);
      }

      .map-name {
        font-size: var(--lumo-font-size-m);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        line-height: var(--lumo-line-height-xs);
      }
    `;
  }

  @property()
  name?: string;

  @property()
  pool?: LivePool;

  @property()
  isActive?: boolean;

  @property()
  isUsersTurn?: boolean;

  renderMap(mapName: string, disabled: boolean, availableIndex?: number) {
    return html`<vaadin-button
      theme="contrast"
      ?disabled=${disabled}
      @click=${() => {
        this.dispatchEvent(
          new CustomEvent('map-selected', {
            detail: {map: mapName, index: availableIndex},
          })
        );
      }}
    >
      ${mapName}
    </vaadin-button>`;
  }

  render() {
    const isActive = this.isActive;
    const isUsersTurn = this.isUsersTurn;

    const isPoolActive = isActive && isUsersTurn;

    console.log(isActive, isUsersTurn, isPoolActive);

    return html`<div class="card">
      <h3>${this.name}</h3>
      <div class="maps">
        ${this.pool?.pool.original.map((mapDescriptor) => {
          let availableIndex;
          if (this.pool?.pool.available) {
            availableIndex = this.pool?.pool.available.indexOf(mapDescriptor);
          }

          let isDisabled = false;

          for (const bannedItem of this.pool?.pool?.banned || []) {
            if (bannedItem.item === mapDescriptor) {
              isDisabled = true;
              break;
            }
          }

          for (const selectedItem of this.pool?.pool?.selected || []) {
            if (selectedItem.item === mapDescriptor) {
              isDisabled = true;
              break;
            }
          }

          if (!isPoolActive) {
            isDisabled = true;
          }

          return html`${this.renderMap(
            mapDescriptor,
            isDisabled,
            availableIndex
          )}`;
        })}
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-map-pool': PickBanMapPool;
  }
}

export default PickBanMapPool;
