import {TextFieldValueChangedEvent} from '@vaadin/text-field';
import {html, LitElement, css} from 'lit';
import {PickBanAdapter} from '../../classes/PickBanAdapter';
import {customElement, state} from 'lit/decorators.js';
import {Router} from '@vaadin/router';
import '@vaadin/button';
import {notificationService} from '../../services/notification';

@customElement('pick-ban-join-session')
class PickBanJoinSession extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
      }

      .fields {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
      }
    `;
  }

  @state()
  joinCode?: string;

  renderJoinCodeInput() {
    return html`
      <vaadin-text-field
        .value=${this.joinCode}
        label="Join code"
        @value-changed=${(e: TextFieldValueChangedEvent) => {
          this.joinCode = e.detail.value;
        }}
      ></vaadin-text-field>
    `;
  }

  render() {
    return html`
      <div class="fields">${this.renderJoinCodeInput()}</div>
      <vaadin-button
        ?disabled=${!this.joinCode}
        theme="primary"
        @click=${async () => {
          try {
            if (!this.joinCode) {
              throw new Error('Join code is required');
            }

            const session = await PickBanAdapter.joinSessionWithCode(
              this.joinCode
            );
            Router.go(`/pick-ban-tool/${session.session.id}`);
          } catch (error) {
            console.error(error);
            notificationService.instance?.addNotification({
              duration: 3000,
              content: (error as Error)?.message
                ? (error as Error).message
                : 'Error joining session',
              theme: 'error',
            });
          }
        }}
      >
        Join Session
      </vaadin-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-join-session': PickBanJoinSession;
  }
}

export default PickBanJoinSession;
