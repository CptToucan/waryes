import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import '@vaadin/email-field';
import '@vaadin/password-field';
import '@vaadin/button';
import '@vaadin/notification';
import '@vaadin/horizontal-layout';
import '@vaadin/icon';
import {FirebaseService} from '../services/firebase';
import '../components/user-credentials';
import {CredentialsSubmitEvent} from '../components/user-credentials';
import {notificationService} from '../services/notification';
import {Router} from '@vaadin/router';

interface RegisterDetails {
  email: string;
  password: string;
}

@customElement('register-route')
export class RegisterRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: center;
        padding: var(--lumo-space-l);
      }

      .page {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--lumo-space-l);
        max-width: calc(var(--lumo-size-m) * 10);
      }

      .form-structure {
        display: flex;
        flex-direction: column;
      }

      .form-header {
        margin: 0;
        margin-top: calc(
          var(--lumo-font-size-xxxl) - var(--lumo-font-size-xxl)
        );
        color: var(--lumo-header-text-color);
      }

      vaadin-button {
        margin-top: 16px;
      }
    `;
  }

  registerDetails: RegisterDetails = {
    email: '',
    password: '',
  };

  @property()
  notificationOpened = false;

  async register(event: CredentialsSubmitEvent) {
    try {
      if (!FirebaseService.auth) {
        throw new Error('Auth service is not initialised');
      }

      await createUserWithEmailAndPassword(
        FirebaseService.auth,
        event.detail.value.email,
        event.detail.value.password
      );

      notificationService.instance?.addNotification({
        duration: 3000,
        content: 'Successfuly registered',
        theme: 'success',
      });

      Router.go('/');
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to create an account.';
      if (error.message) {
        errorMessage = error.message;
      }

      notificationService.instance?.addNotification({
        duration: 3000,
        content: errorMessage,
        theme: 'error',
      });
    }
  }

  render(): TemplateResult {
    return html`
      <div class="page">
        <h2 class="form-header">Register</h2>
        <user-credentials
          submitLabel="Register"
          @credentials-submit=${this.register}
        ></user-credentials>
      </div>
    `;
  }
}

/**
 *         <span>
          To get access to some of the best features, you need an account. Sign
          up with an email and password below.
        </span>
 */
