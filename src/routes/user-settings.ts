import {getAuth, signInWithEmailAndPassword, User} from 'firebase/auth';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
import '@vaadin/dialog';
import '@vaadin/login';
import {dialogRenderer} from '@vaadin/dialog/lit.js';
import {LoginFormLoginEvent} from '@vaadin/login/vaadin-login-form';
import { notificationService } from '../services/notification';
import { Router } from '@vaadin/router';

@customElement('user-settings-route')
export class UserSettingsRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: center;
        padding: var(--lumo-space-m);
      }

      .page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        max-width: 800px;
        margin: 0 auto; /* Center the container horizontally */
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-m);
      }

      h2 {
        margin: 0;
      }
    `;
  }

  @property()
  loggedInUser: User | null | undefined;

  @property()
  showingLogin = false;

  @property()
  loginError = false;

  async login(event: LoginFormLoginEvent) {
    try {
      const auth = getAuth();
      const signInResponse = await signInWithEmailAndPassword(
        auth,
        event.detail.username,
        event.detail.password
      );
      await signInResponse.user.delete();

      notificationService.instance?.addNotification({
        duration: 3000,
        content: "Account deleted successfully",
        theme: 'success',
      });

      Router.go("/");
     
    } catch (error: any) {
      console.error(error);

      notificationService.instance?.addNotification({
        duration: 3000,
        content: "Failed to delete account",
        theme: 'error',
      });
    }
  }

  async onBeforeEnter() {
    FirebaseService.auth?.onAuthStateChanged((user) => {
      this.loggedInUser = user;
    });
  }

  render(): TemplateResult {
    if (this.loggedInUser == null) {
      return html`
        <div class="page">You must be logged in to view this page.</div>
      `;
    }
    return html`
      <vaadin-dialog
        header-title="Log in to delete account"
        @opened-changed=${(event: CustomEvent) => {
          if (event.detail.value === false) {
            this.showingLogin = false;
          }
        }}
        ${dialogRenderer(
          () =>
            html`
              <vaadin-login-form
                .noForgotPassword=${true}
                @login=${this.login}
                ?error=${this.loginError}
              ></vaadin-login-form>
            `
        )}
        .opened="${this.showingLogin}"
      ></vaadin-dialog>

      <div class="page">
        <h2>User Settings</h2>

        <h3>Delete Account</h3>
        If you want to delete your account you can do so here. This will delete
        all of your data and you will no longer be able to log in.
        <vaadin-button
          theme="error"
          @click="${() => {
            this.showingLogin = true;
          }}"
        >
          Delete Account
        </vaadin-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'user-settings-route': UserSettingsRoute;
  }
}
