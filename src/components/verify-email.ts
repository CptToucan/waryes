import {Router} from '@vaadin/router';
import {sendEmailVerification, signOut} from 'firebase/auth';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
import {notificationService} from '../services/notification';

@customElement('verify-email')
export class VerifyEmail extends LitElement {
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
    `;
  }

  async verifyEmail() {
    console.log('verify email');

    const user = FirebaseService?.auth?.currentUser;

    if (user) {
      await sendEmailVerification(user);

      notificationService.instance?.addNotification({
        content: 'Verification email sent',
        theme: 'success',
        duration: 5000,
      });

      await signOut(FirebaseService.auth);
    } else {
      console.log('no user');
      notificationService.instance?.addNotification({
        content: 'No user',
        theme: 'error',
        duration: 5000,
      });
    }
  }

  async reloadUser() {
    const user = FirebaseService?.auth?.currentUser;
    if (user) {
      signOut(FirebaseService.auth);
      Router.go('/login');
    }
  }

  render(): TemplateResult {
    return html`
      <div class="page">
        Your account has been created, but the email has not been verified. Verify your email and try logging in again.
        <vaadin-button
          @click=${() => {
            this.reloadUser();
          }}
        >
          Log in
        </vaadin-button>

        Didn't receive a verification email? Click here to send another one.
      <vaadin-button
        @click=${() => {
          this.verifyEmail();
        }}
        >Verify Email</vaadin-button
      >
      </div>

      


    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'verify-email': VerifyEmail;
  }
}
