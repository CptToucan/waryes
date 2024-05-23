import {ReactiveController, ReactiveControllerHost} from 'lit';
import {PickBanAdapter} from '../classes/PickBanAdapter';
import {notificationService} from '../services/notification';
import {DivisionsMap} from '../types/deck-builder';
import {
  POOL_TYPE,
  PICK_TYPE,
  WrappedPickBanSession,
  DIVISION_ALLIANCE,
} from '../types/PickBanTypes';

export class PickBanSessionController implements ReactiveController {
  host: ReactiveControllerHost;
  sessionId: string;
  session?: WrappedPickBanSession;
  old_session?: WrappedPickBanSession;
  divisionsMap: DivisionsMap;

  private _intervalID?: number;

  constructor(
    host: ReactiveControllerHost,
    sessionId: string,
    divisionsMap: DivisionsMap
  ) {
    (this.host = host).addController(this);
    this.sessionId = sessionId;
    this.divisionsMap = divisionsMap;
  }

  async hostConnected() {
    await this.updateSession();
    this._intervalID = setInterval(async () => {
      await this.updateSession();
    }, 5000) as unknown as number;
  }

  private async updateSession() {
    const session = await PickBanAdapter.getSession(this.sessionId);

    this.old_session = this.session;
    this.session = session.session;

    if (this.old_session !== this.session) {
      await this.host.requestUpdate();
    }

    if (
      this.old_session &&
      this.session &&
      this.old_session?.session?.history?.length !==
        this.session?.session?.history?.length
    ) {
      // get the last history item

      const lastAction =
        this.session?.session?.history[
          this.session?.session?.history.length - 1
        ];

      const userName = lastAction.selectedItem.user.name;
      let item = lastAction.selectedItem.item;
      const action = lastAction.stage.type;

      let actionString = '';

      if (action === PICK_TYPE.PICK) {
        actionString = 'picked';
      }
      if (action === PICK_TYPE.BAN) {
        actionString = 'banned';
      }

      const poolType = lastAction.stage.poolType;

      if (poolType === POOL_TYPE.DIVISION) {
        item = this.divisionsMap[item].name || item;
      }

      notificationService.instance?.addNotification({
        content: `${userName} ${actionString} ${item}`,
        duration: 5000,
        theme: '',
      });
    }

    await this.host.requestUpdate();
  }

  public async start() {
    await PickBanAdapter.startSession(this.sessionId);
  }

  public async leave() {
    await PickBanAdapter.leaveSession(this.sessionId);
  }

  public async pick(pickIndex: number) {
    await PickBanAdapter.pick(this.sessionId, pickIndex);
  }

  public async ban(banIndex: number) {
    try {
      await PickBanAdapter.ban(this.sessionId, banIndex);
    } catch (error) {
      console.error(error);
      notificationService.instance?.addNotification({
        content: `${error}`,
        duration: 5000,
        theme: 'error',
      });
    }
  }

  public async pickSide(side: DIVISION_ALLIANCE) {
    await PickBanAdapter.pickSide(this.sessionId, side);
  }

  hostDisconnected(): void {
    clearInterval(this._intervalID);
    this._intervalID = undefined;
  }
}