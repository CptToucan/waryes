import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {User} from 'firebase/auth';
import {
  PickBanSessionController,
} from '../controllers/pick-ban-session-controller';
import '@vaadin/button';
import '../components/pick-ban/session-lobby';
import '../components/pick-ban/active-session';
import { LoadUnitsAndDivisionsMixin } from '../mixins/load-units-and-divisions';

@customElement('pick-ban-session-route')
export class PickBanSessionRoute
  extends LoadUnitsAndDivisionsMixin(LitElement)
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        padding: var(--lumo-space-s);

        align-items: center;
        flex-direction: column;
        flex: 1 1 100%;
        height: 100%;
        box-sizing: border-box;
      }

      pick-ban-active-session {
        width: 100%;
      }

      .fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
      }

    `;
  }

  @state()
  loggedInUser: User | null | undefined;

  private sessionController?: PickBanSessionController;

  async onBeforeEnter(location: RouterLocation) {
    FirebaseService.auth?.onAuthStateChanged(async (user) => {
      this.loggedInUser = user;
    });

    const sessionId = `${location.params.sessionId}`;
    await this.loadUnitsAndDivisions();
    this.sessionController = new PickBanSessionController(this, sessionId, this.divisionsMap);
  }


  renderUsers(userIds: string[]) {
    return html`
      <div>
        <div>Users</div>
        ${userIds.map((userId) => html` <div>${userId}</div> `)}
      </div>
    `;
  }

  renderLobby() {
    return html`
      <pick-ban-session-lobby
        .session=${this.sessionController?.session}
        @start-game=${() => {
          this.sessionController?.start();
        }}
      ></pick-ban-session-lobby>
    `;
  }

  renderGame() {
    return html`<pick-ban-active-session .user=${this.loggedInUser} .session=${this.sessionController?.session} .divisionsMap=${this.divisionsMap}
    
      @selection=${(event: CustomEvent) => {
        event.detail.index;

        console.log(event.detail);

        if(event.detail.type === 'PICK') {
          this.sessionController?.pick(event.detail.index)
        }
        if(event.detail.type === 'BAN') {
          this.sessionController?.ban(event.detail.index)
        }
        if(event.detail.type === 'PICK_SIDE') {
          this.sessionController?.pickSide(event.detail.choice)
        }

      }
    }
        
    >

    </pick-ban-active-session>`;
  }

  render(): TemplateResult {
    if (!this.sessionController?.session) {
      return html`No session`;
    }
    
    let output = html``;
    if(this.sessionController?.session?.session?.finished) {
      output = html`${this.renderGame()}`;
    }
    else if (this.sessionController?.session?.session?.activeTeam === undefined) {
      output = this.renderLobby();
    } else {
      output = this.renderGame();
    }

    return html`<vaadin-button class="fab" @click=${() => this.sessionController?.leave()}>Leave</vaadin-button> ${output} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-session-route': PickBanSessionRoute;
  }
}
