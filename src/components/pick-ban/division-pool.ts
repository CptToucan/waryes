import {html, LitElement, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {LivePool} from '../../types/PickBanTypes';
import {DivisionsMap} from '../../types/deck-builder';

@customElement('pick-ban-division-pool')
class PickBanDivisionPool extends LitElement {
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

      .divisions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        grid-auto-rows: minmax(
          80px,
          1fr
        ); /* Set row height to same as column width */
        gap: var(--lumo-space-xs);
      }

      .division-choice {
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

      .division-choice[disabled] {
        opacity: 0.3;
        cursor: default;
      }

      .division-choice:hover {
        background-color: var(--lumo-contrast-10pct);
      }

      .division-choice[disabled]:hover {
        background-color: var(--lumo-contrast-5pct);
      }

      .division-choice:focus {
        outline: 1px solid var(--lumo-primary-color-50pct);
        background-color: var(--lumo-contrast-10pct);
      }

      .division-choice:active {
        background-color: var(--lumo-contrast-20pct);
      }

      .division-name {
        font-size: var(--lumo-font-size-xxs);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        line-height: var(--lumo-line-height-xs);
      }

      .division-choice division-flag {
        width: unset;
        display: flex;
        max-width: 60px;
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

  @property({type: Object})
  divisionsMap?: DivisionsMap;

  renderDivision(
    divisionDescriptor: string,
    disabled: boolean,
    availableIndex?: number
  ) {
    const division = this.divisionsMap?.[divisionDescriptor];
    const divisionName = division?.name ?? divisionDescriptor;

    return html`<button
      class="division-choice"
      ?disabled=${disabled}
      @click=${() => {
        this.dispatchEvent(
          new CustomEvent('division-selected', {
            detail: {division: divisionDescriptor, index: availableIndex},
          })
        );
      }}
    >
      <division-flag .divisionId=${divisionDescriptor}></division-flag
      ><span class="division-name">${divisionName}</span>
    </button>`;
  }

  render() {
    const isActive = this.isActive;
    const isUsersTurn = this.isUsersTurn;

    const isPoolActive = isActive && isUsersTurn;

    console.log(isActive, isUsersTurn, isPoolActive);

    return html`<div class="card">
      <h3>${this.name}</h3>
      <div class="divisions">
        ${this.pool?.pool.original.map((divisionDescriptor) => {
          let availableIndex;
          if (this.pool?.pool.available) {
            availableIndex =
              this.pool?.pool.available.indexOf(divisionDescriptor);
          }

          let isDisabled = false;

          for (const bannedItem of this.pool?.pool?.banned || []) {
            if (bannedItem.item === divisionDescriptor) {
              isDisabled = true;
              break;
            }
          }

          for (const selectedItem of this.pool?.pool?.selected || []) {
            if (selectedItem.item === divisionDescriptor) {
              isDisabled = true;
              break;
            }
          }

          if (!isPoolActive) {
            isDisabled = true;
          }

          return html`${this.renderDivision(
            divisionDescriptor,
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
    'pick-ban-division-pool': PickBanDivisionPool;
  }
}

export default PickBanDivisionPool;
