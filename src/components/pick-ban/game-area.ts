import {html, LitElement, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {
  HistoryItem,
  PICK_TYPE,
  POOL_TYPE,
  PickBanStage,
  UserDescriptor,
} from '../../types/PickBanTypes';

@customElement('pick-ban-game-area')
class PickBanGameArea extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 100%;
        box-sizing: border-box;
      }

      .game-area {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-m);
        padding: var(--lumo-space-xs);
        align-items: center;
        justify-content: center;
        width: 100%;
        box-sizing: border-box;
      }

      .card {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-s);
        padding: var(--lumo-space-s);
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        box-sizing: border-box;
      }

      .card.inverse {
        align-items: flex-end;
      }

      .picks {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-xs);
      }

      .map-pick-slot {
        background-color: var(--warno-good-40pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--lumo-font-size-xl);
        min-height: 30px;
        min-width: 80px;
      }

      .map-ban-slot {
        background-color: var(--warno-very-bad-40pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--lumo-font-size-s);
        min-height: 20px;
        min-width: 80px;
      }

      .division-pick-slot {
        height: 100px;
        width: 100px;
        background-color: var(--warno-good-40pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
      }

      .division-pick-slot division-flag {
        width: 100%;
      }

      .division-ban-slot division-flag {
        width: 100%;
      }

      .bans {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-xs);
      }

      .division-ban-slot {
        height: 80px;
        width: 80px;
        background-color: var(--warno-very-bad-40pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
      }

      .team-1 {
        border: 1px solid var(--warno-exceptional);
      }

      .team-2 {
        border: 1px solid var(--warno-bad);
      }
    `;
  }

  @property()
  gameSlots: (UserDescriptor | null)[] = [];

  @property()
  stages: PickBanStage[] = [];

  @property()
  history: HistoryItem[] = [];

  getHistoryForStage(stage: PickBanStage) {
    const index = this.stages.indexOf(stage);
    if (index === -1) {
      return null;
    }

    return this.history[index];
  }

  get mapPicks() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.PICK && stage.poolType === POOL_TYPE.MAP
    );
  }

  get mapBans() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.BAN && stage.poolType === POOL_TYPE.MAP
    );
  }

  get player1() {
    return this.gameSlots[0];
  }

  get player1DivisionPicks() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.PICK &&
        stage.team === 1 &&
        stage.poolType === POOL_TYPE.DIVISION
    );
  }

  get player1MapPicks() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.PICK &&
        stage.team === 1 &&
        stage.poolType === POOL_TYPE.MAP
    );
  }

  get player1DivisionBans() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.BAN &&
        stage.team === 1 &&
        stage.poolType === POOL_TYPE.DIVISION
    );
  }

  get player1MapBans() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.BAN &&
        stage.team === 1 &&
        stage.poolType === POOL_TYPE.MAP
    );
  }

  get player2() {
    return this.gameSlots[1];
  }

  get player2DivisionPicks() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.PICK &&
        stage.team === 2 &&
        stage.poolType === POOL_TYPE.DIVISION
    );
  }

  get player2MapPicks() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.PICK &&
        stage.team === 2 &&
        stage.poolType === POOL_TYPE.MAP
    );
  }

  get player2DivisionBans() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.BAN &&
        stage.team === 2 &&
        stage.poolType === POOL_TYPE.DIVISION
    );
  }

  get player2MapBans() {
    return this.stages.filter(
      (stage) =>
        stage.type === PICK_TYPE.BAN &&
        stage.team === 2 &&
        stage.poolType === POOL_TYPE.MAP
    );
  }

  render() {
    return html` <div class="game-area">
        <div class="card">
          Map
          ${this.renderMapCardContent(this.mapPicks, this.mapBans)}
        </div>
      </div>
      <div class="game-area">
        <div class="card inverse team-1">
          ${this.renderDivisionCardContent(
            this.player1,
            this.player1DivisionPicks,
            this.player1DivisionBans
          )}
        </div>
        <div class="card team-2">
          ${this.renderDivisionCardContent(
            this.player2,
            this.player2DivisionPicks,
            this.player2DivisionBans
          )}
        </div>
      </div>`;
  }

  renderDivisionSelection(stage: PickBanStage, type: 'pick' | 'ban') {
    const history = this.getHistoryForStage(stage);
    const className = `division-${type}-slot`;
    if (!history) {
      return html`<div class=${className}></div>`;
    }
    return html`<div class=${className}>
      <division-flag .divisionId=${history.selectedItem.item}></division-flag>
    </div>`;
  }

  renderDivisionCardContent(
    player: UserDescriptor | null,
    picks: PickBanStage[],
    bans: PickBanStage[]
  ) {
    if (!player) {
      return html`<span>Empty</span>`;
    }

    return html`<span>${player.name}</span>
      <div class="picks">
        ${picks.map((_pick) => this.renderDivisionSelection(_pick, 'pick'))}
      </div>
      <div class="bans">
        ${bans.map((_ban) => this.renderDivisionSelection(_ban, 'ban'))}
      </div>`;
  }

  renderMapCardContent(picks: PickBanStage[], bans: PickBanStage[]) {
    return html`
      <div class="picks">
        ${picks.map((_pick) => this.renderMapSelection(_pick, 'pick'))}
      </div>
      <div class="bans">
        ${bans.map((_ban) => this.renderMapSelection(_ban, 'ban'))}
      </div>
    `;
  }

  renderMapSelection(stage: PickBanStage, type: 'pick' | 'ban') {
    const history = this.getHistoryForStage(stage);
    const className = `map-${type}-slot`;

    if (!history) {
      return html`<div class=${className}></div>`;
    }

    return html`
      <div class=${className}>
        <span>${history.selectedItem.item}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-game-area': PickBanGameArea;
  }
}

export default PickBanGameArea;
