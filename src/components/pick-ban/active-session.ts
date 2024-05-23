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
        gap: var(--lumo-space-m);
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

  /*
  renderPool(
    pool: LivePool,
    isActive: boolean,
    isUsersTurn: boolean,
    activeStage?: PickBanStage
  ) {
    if (!pool) {
      return html`<div>No pool</div>`;
    }

    const canUserPick = isActive && isUsersTurn;

    let isDivisionPool = false;

    if (pool.type === 'DIVISION') {
      isDivisionPool = true;
    }

    let choiceRenderer = this.renderChoices.bind(this);
    let selectionRenderer = this.renderSelections.bind(this);

    if (isDivisionPool) {
      choiceRenderer = this.renderDivisionChoices.bind(this);
      selectionRenderer = this.renderDivisionSelections.bind(this);
    }

    return html`
      <div class="pool ${isActive ? 'active' : ''}">
        <vaadin-details opened>
          <h3 slot="summary">${pool.type}</h3>
          <div class="pool-group">
            <div class="pool-title">Available</div>
            <div class="choices">
              ${choiceRenderer(
                pool.pool.available,
                !canUserPick,
                activeStage?.type
              )}
            </div>

            <div class="pool-group">
              <div class="pool-title">Picked</div>
              <div class="choices">
                ${selectionRenderer(pool.pool.selected)}
              </div>
            </div>

            <div class="pool-group">
              <div class="pool-title">Banned</div>
              <div class="choices">${selectionRenderer(pool.pool.banned)}</div>
            </div>
          </div>
        </vaadin-details>
      </div>
    `;
  }
  */

  /*
  renderSelections(choices: PickBanSelectedItem[]) {
    return html`${choices.map((choice) => {
      return html`<div>
        <div>${choice.user.name}</div>
        <div class="selection-item"><span>${choice.item}</span></div>
      </div>`;
    })}`;
  }
  */

  /*
  renderChoices(choices: string[], disabled: boolean, type?: string) {
    let buttonTheme = 'contrast';

    if (this.activeStage?.type === PICK_TYPE.BAN) {
      buttonTheme = 'error';
    } else if (this.activeStage?.type === PICK_TYPE.PICK) {
      buttonTheme = 'success';
    }

    return html`${choices.map((choice: string, index: number) => {
      return html`<vaadin-button
        theme="${buttonTheme} small primary"
        ?disabled=${this.requestMade || disabled}
        @click=${() => {
          this.dispatchEvent(
            new CustomEvent('selection', {
              detail: {
                choice,
                index,
                type,
              },
            })
          );
          this.startTimer();
        }}
        >${choice}</vaadin-button
      >`;
    })}`;
    
  }
  */

  /*
  renderDivisionChoices(choices: string[], disabled: boolean, type?: string) {
    return html`${choices.map((choice: string, index: number) => {
      const division = this.divisionsMap?.[choice];
      const divisionName = division?.name ?? choice;

      let buttonTheme = 'contrast';

      if (this.activeStage?.type === PICK_TYPE.BAN) {
        buttonTheme = 'error';
      } else if (this.activeStage?.type === PICK_TYPE.PICK) {
        buttonTheme = 'success';
      }

      return html`<vaadin-button
        class="division"
        theme="${buttonTheme} small primary"
        ?disabled=${this.requestMade || disabled}
        @click=${() => {
          this.dispatchEvent(
            new CustomEvent('selection', {
              detail: {
                choice,
                index,
                type,
              },
            })
          );
          this.startTimer();
        }}
        ><division-flag
          slot="prefix"
          style="width: 25px; min-width: 25px"
          .divisionId=${choice}
        ></division-flag>
        ${divisionName}</vaadin-button
      >`;
    })}`;
  }

  renderDivisionSelections(choices: PickBanSelectedItem[]) {
    return html`${choices.map((choice) => {
      const division = this.divisionsMap?.[choice.item];
      const divisionName = division?.name ?? choice.item;

      return html`<div class="division-choice">
        <div>${choice.user.name}</div>
        <div class="selection-item">
          <division-flag
            slot="prefix"
            .divisionId=${choice.item}
          ></division-flag
          ><span>${divisionName}</span>
        </div>
      </div>`;
    })}`;
  }
  */

  /*
  renderPools(
    pools:
      | {
          MAP: LivePool;
          DIVISION: {
            NATO: LivePool;
            PACT: LivePool;
            NEUTRAL: LivePool;
          };
        }
      | undefined,
    activePool: LivePool | null,
    isUsersTurn: boolean,
    activeStage?: PickBanStage
  ) {
    console.log(pools, activePool, isUsersTurn, activeStage);

    if (!pools) {
      return html`<div>No pools</div>`;
    }

    const mapPool = pools.MAP;
    const divisionPool = pools.DIVISION;

    const mapPoolOutput = html`
      ${this.renderPool(
        mapPool,
        mapPool === activePool,
        isUsersTurn,
        activeStage
      )}
    `;

    const natoOutput = html`
      ${this.renderPool(
        divisionPool.NATO,
        divisionPool.NATO === activePool,
        isUsersTurn,
        activeStage
      )}
    `;

    const pactOutput = html`
      ${this.renderPool(
        divisionPool.PACT,
        divisionPool.PACT === activePool,
        isUsersTurn,
        activeStage
      )}
    `;

    const neutralOutput = html`
      ${this.renderPool(
        divisionPool.NEUTRAL,
        divisionPool.NEUTRAL === activePool,
        isUsersTurn,
        activeStage
      )}
    `;

    const divisionOutput = [];
    if (this.session?.session.config.mode === MODE.NATO_V_PACT) {
      divisionOutput.push(natoOutput, pactOutput);
    }
    if (this.session?.session.config.mode === MODE.NATO_V_NATO) {
      divisionOutput.push(natoOutput);
    }
    if (this.session?.session.config.mode === MODE.PACT_V_PACT) {
      divisionOutput.push(pactOutput);
    }
    if (this.session?.session.config.mode === MODE.ALL_V_ALL) {
      divisionOutput.push(neutralOutput);
    }

    return html`<div class="pools">
      <div class="grouped-pools">${mapPoolOutput}</div>
      <div class="grouped-pools">${divisionOutput}</div>
    </div>`;
  }

  renderSideSelector(isUsersTurn: boolean) {
    return html`
      <div class="side-selector">
        ${isUsersTurn
          ? html`<h2>Pick an alliance</h2>`
          : html`<h2>Opponent is picking an alliance</h2>`}
        ${isUsersTurn
          ? html` <div class="choices">
              <vaadin-button
                theme="contrast small primary"
                @click=${() => {
                  this.dispatchEvent(
                    new CustomEvent('selection', {
                      detail: {
                        choice: 'NATO',
                        type: 'PICK_SIDE',
                      },
                    })
                  );
                }}
                >NATO</vaadin-button
              >
              <vaadin-button
                theme="contrast small primary"
                @click=${() => {
                  this.dispatchEvent(
                    new CustomEvent('selection', {
                      detail: {
                        choice: 'PACT',
                        type: 'PICK_SIDE',
                      },
                    })
                  );
                }}
                >PACT</vaadin-button
              >
            </div>`
          : ''}
      </div>
    `;
  }
  */

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
      ></pick-ban-game-area>
    `;
  }

  renderTitle(config: PickBanConfig) {
    return html` <h1>${config.name}</h1> `;
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
        @map-selected=${(event: CustomEvent) => {
          const {index} = event.detail;

          console.log(event.detail);
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

    /*
    let renderSideSelector = false;

    if (this.activeStage?.type === PICK_TYPE.SIDE_PICK) {
      renderSideSelector = true;
    }

    return html`
      <h1 class="instruction">
        ${this.activeUser?.name} | ${this.activeStage?.type} |
        ${this.activeStage?.poolType}
      </h1>

      ${this.renderGameUsers()}
      ${renderSideSelector ? this.renderSideSelector(this.isUsersTurn) : ''}

      <div class="layout">
        ${!renderSideSelector
          ? this.renderPools(
              this.pools,
              this.activePool,
              this.isUsersTurn,
              this.activeStage
            )
          : ''}
        ${this.renderStages(this.stages || [], this.activeStageIndex || 0)}
      </div>
    `;
    */
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-active-session': PickBanActiveSession;
  }
}

export default PickBanActiveSession;

/*
        ${this.activePool ? this.renderPools(
          this.pools || {}, // Add a default value of an empty object if `this.pools` is `undefined`
          this.activePool,
          this.isUsersTurn,
          this.activeStage
        ) : ''}
        */
