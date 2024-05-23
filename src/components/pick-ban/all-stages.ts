import {html, LitElement, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {PICK_TYPE, POOL_TYPE, PickBanStage} from '../../types/PickBanTypes';

@customElement('pick-ban-all-stages')
class PickBanAllStages extends LitElement {
  static get styles() {
    return css`
      .stages {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: var(--lumo-space-xs);
        padding: var(--lumo-space-xs);
        border-radius: var(--lumo-border-radius);
        box-sizing: border-box;
        flex-wrap: wrap;
        max-width: 100%;
      }

      .stage-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--lumo-space-xs);
        max-width: 100px;
      }

      .stage {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: var(--lumo-space-xs);
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        font-size: var(--lumo-font-size-s);
        overflow: hidden;
        width: 70px !important;
        padding-right: var(--lumo-space-s);
      }

      .pick {
        background-color: var(--warno-good-40pct);
      }

      .ban {
        background-color: var(--warno-very-bad-40pct);
      }

      .team-indicator {
        height: 4px;
        width: 100%;
        border-radius: var(--lumo-border-radius-s);
      }

      .team-indicator.team-1 {
        background-color: var(--warno-exceptional);
      }

      .team-indicator.team-2 {
        background-color: var(--warno-bad);
      }

      .pool-type {
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--lumo-contrast-10pct);
        padding: var(--lumo-space-xs) var(--lumo-space-s);
        height: 100%;
        box-sizing: border-box;
      }

      .stage-type {
        padding: var(--lumo-space-xs) 0;
      }

      .active {
        box-sizing: border-box;
        outline: 2px solid var(--lumo-primary-color-50pct);
      }
    `;
  }

  @property()
  activeStageIndex: number = 0;

  @property()
  stages: PickBanStage[] = [];

  letterMap = {
    [POOL_TYPE.DIVISION]: 'D',
    [POOL_TYPE.MAP]: 'M',
  };

  render() {
    return html` <div class="stages">
      ${this.stages.map((stage, index) => {
        const isActive = index === this.activeStageIndex;
        const teamClass = stage.team === 1 ? 'team-1' : 'team-2';
        let pickOrBan = '';

        if (stage.type === PICK_TYPE.PICK) {
          pickOrBan = 'pick';
        } else if (stage.type === PICK_TYPE.BAN) {
          pickOrBan = 'ban';
        }

        return html`<div class="stage-wrapper">
          <div class="stage ${isActive ? 'active' : ''} ${pickOrBan}">
            <div class="pool-type">
              ${stage.poolType ? this.letterMap[stage.poolType] : ''}
            </div>
            <div class="stage-type">${stage.type}</div>
          </div>
          <div class="team-indicator ${teamClass}"></div>
        </div>`;
      })}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-all-stages': PickBanAllStages;
  }
}

export default PickBanAllStages;

/*

renderStages(stages: PickBanStage[], activeStageIndex: number) {
  console.log(stages, activeStageIndex);
  

  return html`

  `;

  /*
  return html`
    <div class="stages">
      ${stages.map((stage, index) => {
        let user = this.session?.session?.gameSlots[stage.team - 1];
        const historyForStage = this.history?.[index];
        const pool = this.getPoolForStage(stage);

        if (!pool) {
          return html`<div>No pool</div>`;
        }

        let itemName = historyForStage?.selectedItem?.item;

        const isDivision = pool.type === POOL_TYPE.DIVISION;

        let divisionDescriptor;

        if (isDivision) {
          divisionDescriptor = itemName;

          if (divisionDescriptor) {
            itemName =
              this.divisionsMap?.[divisionDescriptor]?.name || itemName;
          }
        }

        return html`
          <div
            class="stage ${stage.type?.toLowerCase()} ${index ===
            activeStageIndex
              ? 'active'
              : ''}"
          >
            <div>${user?.name} | ${stage.type} | ${stage.poolType}</div>
            ${historyForStage
              ? html`<div class="selection-item">
                  ${isDivision
                    ? html`<division-flag
                        .divisionId=${divisionDescriptor}
                      ></division-flag>`
                    : ''}
                  <span style="color: var(--lumo-contrast-70pct)"
                    >${itemName}</span
                  >
                </div>`
              : ''}
          </div>
        `;
      })}
    </div>
  `;
  
}
*/
