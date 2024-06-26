import {html, LitElement, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/button';
import {User} from 'firebase/auth';
import {DivisionsMap} from '../../types/deck-builder';
import {
  LivePool,
  PICK_TYPE,
  POOL_TYPE,
  WrappedPickBanSession,
  PickBanStage,
  DIVISION_ALLIANCE,
  UserDescriptor,
  PickBanConfig,
  HistoryItem,
  MODE,
} from '../../types/PickBanTypes';

import './all-stages';
import './game-area';
import './division-pool';
import './map-pool';

@customElement('pick-ban-active-session')
class PickBanActiveSession extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        flex-direction: column;
        flex: 1 1 100%;
        height: 100%;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        gap: var(--lumo-space-xs);
      }

      h1,
      h2,
      h3 {
        margin: 0;
      }
    `;
  }

  @property()
  session?: WrappedPickBanSession;

  @property({type: Object})
  user?: User;

  @property({type: Object})
  divisionsMap?: DivisionsMap;

  @state()
  requestMade = false;

  get activeStage() {
    return this.stages?.[this.activeStageIndex || 0];
  }

  get activeStageIndex() {
    return this.session?.session?.currentStageIndex;
  }

  get stages() {
    return this.session?.session?.config?.stages;
  }

  get pools() {
    return this.session?.session?.pools;
  }

  get activePool(): LivePool | null {
    const activePoolType = this.activeStage?.poolType;

    if (!activePoolType) {
      return null;
    }

    const poolGroup = this.pools?.[activePoolType];

    if (activePoolType === POOL_TYPE.MAP) {
      return poolGroup as LivePool;
    } else if (activePoolType === POOL_TYPE.DIVISION) {
      // determine if PACT or NATO or NEUTRAL
      if (this.activeUser?.side == undefined) {
        return (
          poolGroup as {NATO: LivePool; PACT: LivePool; NEUTRAL: LivePool}
        ).NEUTRAL;
      } else {
        let poolGroupId = this.activeUser?.side;
        if (this.activeStage?.type === PICK_TYPE.BAN) {
          poolGroupId =
            this.activeUser?.side === DIVISION_ALLIANCE.NATO
              ? DIVISION_ALLIANCE.PACT
              : DIVISION_ALLIANCE.NATO;
        }

        return (
          poolGroup as {NATO: LivePool; PACT: LivePool; NEUTRAL: LivePool}
        )[poolGroupId];
      }
    }

    return null;
  }

  get isFinished() {
    return this.session?.session.finished;
  }

  getPoolForStage(stage: PickBanStage) {
    const poolType = stage?.poolType;

    if (!poolType) {
      return null;
    }

    const poolGroup = this.pools?.[poolType];

    if (poolType === POOL_TYPE.MAP) {
      return poolGroup as LivePool;
    } else if (poolType === POOL_TYPE.DIVISION) {
      // determine if PACT or NATO or NEUTRAL
      if (this.activeUser?.side == undefined) {
        return (
          poolGroup as {NATO: LivePool; PACT: LivePool; NEUTRAL: LivePool}
        ).NEUTRAL;
      } else {
        let poolGroupId = this.activeUser?.side;
        if (this.activeStage?.type === PICK_TYPE.BAN) {
          poolGroupId =
            this.activeUser?.side === DIVISION_ALLIANCE.NATO
              ? DIVISION_ALLIANCE.PACT
              : DIVISION_ALLIANCE.NATO;
        }

        return (
          poolGroup as {NATO: LivePool; PACT: LivePool; NEUTRAL: LivePool}
        )[poolGroupId];
      }
    }

    return null;
  }

  get activeTeam() {
    return this.activeStage?.team;
  }

  get activeUser() {
    return this.session?.session?.gameSlots[(this.activeTeam || 1) - 1];
  }

  get isUsersTurn() {
    if (this.isFinished) {
      return false;
    }

    return this.activeUser?.id === this.user?.uid;
  }

  get history() {
    return this.session?.session?.history;
  }

  startTimer() {
    this.requestMade = true;
    setTimeout(() => {
      this.requestMade = false;
    }, 5000);
  }

  renderStages(stages: PickBanStage[], activeStageIndex: number) {
    return html`
      <pick-ban-all-stages
        .activeStageIndex=${activeStageIndex}
        .stages=${stages}
      ></pick-ban-all-stages>
    `;
  }

  renderGameUsers() {
    return html`
      <div class="users">
        ${this.session?.session?.gameSlots.map((user, index) => {
          return html`<div>Team ${index + 1} ${user?.name} ${user?.side}</div>`;
        })}
      </div>
    `;
  }

  renderSelectionArea(
    gameSlots: (UserDescriptor | null)[],
    stages: PickBanStage[],
    history: HistoryItem[]
  ) {
    return html`
      <pick-ban-game-area
        .gameSlots=${gameSlots}
        .stages=${stages}
        .history=${history}
        .interactable=${this.isFinished ? false : this.isUsersTurn}
      ></pick-ban-game-area>
    `;
  }

  renderTitle(config: PickBanConfig) {
    return html` <h1>${config.name}</h1> `;
  }

  renderSideSelector() {
    return html`
      <div class="side-selector">
        <vaadin-button @click=${() => this.startTimer()}>NATO</vaadin-button>
        <vaadin-button @click=${() => this.startTimer()}>PACT</vaadin-button>
      </div>
    `;
  }

  renderDivisionPool(pool: LivePool | null, activeStage: PickBanStage | null) {
    const pickType = activeStage?.type;

    return html`
      <pick-ban-division-pool
        .name=${'All Divisions'}
        .pool=${pool}
        .isActive=${pool === this.activePool}
        .isUsersTurn=${this.isUsersTurn}
        .divisionsMap=${this.divisionsMap}
        .interactable=${this.isFinished ? false : this.isUsersTurn}
        @division-selected=${(event: CustomEvent) => {
          const {index} = event.detail;
          this.dispatchEvent(
            new CustomEvent('selection', {
              detail: {
                index: index,
                type: pickType,
              },
            })
          );
        }}
      ></pick-ban-division-pool>
    `;
  }

  renderMapPool(pool: LivePool | null, activeStage: PickBanStage | null) {
    const pickType = activeStage?.type;

    return html`
      <pick-ban-map-pool
        .name=${'All Maps'}
        .pool=${pool}
        .isActive=${pool === this.activePool}
        .isUsersTurn=${this.isUsersTurn}
        .interactable=${this.isFinished ? false : this.isUsersTurn}
        @map-selected=${(event: CustomEvent) => {
          const {index} = event.detail;
          this.dispatchEvent(
            new CustomEvent('selection', {
              detail: {
                index: index,
                type: pickType,
              },
            })
          );
        }}
      ></pick-ban-map-pool>
    `;
  }

  render() {
    let divisionPoolOutput = null;

    if (this.session?.session?.config?.mode === MODE.NATO_V_PACT) {
      divisionPoolOutput = html`${this.renderDivisionPool(
        this.pools?.DIVISION.NATO || null,
        this.activeStage || null
      )}
      ${this.renderDivisionPool(
        this.pools?.DIVISION.PACT || null,
        this.activeStage || null
      )}`;
    } else if (this.session?.session?.config?.mode === MODE.NATO_V_NATO) {
    } else if (this.session?.session?.config?.mode === MODE.PACT_V_PACT) {
    } else if (this.session?.session?.config?.mode === MODE.ALL_V_ALL) {
      divisionPoolOutput = this.renderDivisionPool(
        this.pools?.DIVISION.NEUTRAL || null,
        this.activeStage || null
      );
    }

    return html`
      ${this.session?.session?.config
        ? this.renderTitle(this.session?.session?.config)
        : 'No config'}
      ${this.renderStages(this.stages || [], this.activeStageIndex || 0)}
      ${this.renderSideSelector()}
      ${this.session?.session?.gameSlots && this.stages
        ? this.renderSelectionArea(
            this.session?.session?.gameSlots,
            this.stages,
            this.history || []
          )
        : ''}
      ${this.renderMapPool(this.pools?.MAP || null, this.activeStage || null)}
      ${divisionPoolOutput}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-active-session': PickBanActiveSession;
  }
}

export default PickBanActiveSession;
