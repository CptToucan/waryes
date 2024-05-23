import {html, LitElement, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@vaadin/button';
import {notificationService} from '../../services/notification';
import {
  TEAM_ASSIGNMENT,
  UserDescriptor,
  WrappedPickBanSession,
} from '../../types/PickBanTypes';

@customElement('pick-ban-session-lobby')
class PickBanSessionLobby extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        flex: 1 1 100%;
        height: 100%;
        box-sizing: border-box;
        width: 100%;
        align-items: flex-start;
        justify-content: center;
        gap: var(--lumo-space-m);
      }

      .container {
        display: flex;
        flex-direction: column;
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-m);
        border-radius: var(--lumo-border-radius);
        max-width: 800px;
        flex: 1 1 100%;
        gap: var(--lumo-space-s);
      }

      table {
        width: 100%;
      }

      td {
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-s);
      }

      ul {
        padding: 0;
        margin: 0;
        list-style-type: none;
      }

      h3 {
        margin: 0;
      }

      .join-code {
        font-size: 18px;
      }
    `;
  }

  @property()
  session?: WrappedPickBanSession;

  copyToClipboard() {
    const code = this?.session?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      notificationService.instance?.addNotification({
        content: 'Code copied to clipboard',
        theme: '',
        duration: 2000,
      });
    }
  }

  render() {
    console.log(this.session?.session);
    // Check if all slots are filled
    let allSlotsFilled = false;
    for (
      let i = 0;
      i < (this?.session?.session?.lobbySlots?.length || 0);
      i++
    ) {
      if (!this?.session?.session?.lobbySlots[i]) {
        allSlotsFilled = false;
        break;
      }
      allSlotsFilled = true;
    }

    return html`
      <div class="container">
        <h3>Lobby</h3>
        <div class="join-code">
          Join Code
          <vaadin-button theme="tertiary" @click="${this.copyToClipboard}"
            >${this?.session?.code}
          </vaadin-button>
        </div>

        <table>
          ${this?.session?.session?.lobbySlots?.map(
            (user: UserDescriptor | null, index: number) => html`
              <tr>
                <td>Player ${index + 1}</td>
                <td>${user ? user?.name : 'Empty'}</td>
              </tr>
            `
          )}
          ${this?.session?.session?.lobbySlots?.length === 0
            ? html` <li>No players in the lobby</li> `
            : ''}
        </table>

        <span>
          ${this?.session?.session?.teamAssignment === TEAM_ASSIGNMENT.RANDOM
            ? 'Players are assigned to team 1 and 2 after the game starts, this lobby does not represent which team is 1 or 2'
            : ''}
          ${this?.session?.session?.teamAssignment === TEAM_ASSIGNMENT.MANUAL
            ? 'The slots in this lobby represent the team assignment, the first slot is team 1, the second slot is team 2.'
            : ''}
        </span>

        <vaadin-button
          theme="primary"
          ?disabled=${!allSlotsFilled}
          @click=${() => {
            this.dispatchEvent(
              new CustomEvent('start-game', {
                detail: {
                  session: this.session,
                },
              })
            );
          }}
        >
          Start
        </vaadin-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-session-lobby': PickBanSessionLobby;
  }
}

export default PickBanSessionLobby;
