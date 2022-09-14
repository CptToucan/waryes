import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import '@vaadin/email-field';
import '@vaadin/password-field';
import '@vaadin/button';
import '@vaadin/notification';
import '@vaadin/horizontal-layout';
import '@vaadin/icon';
import { FirebaseService } from '../services/firebase';
import '../components/user-credentials';
import { CredentialsSubmitEvent } from '../components/user-credentials';import { notificationService } from '../services/notification';


interface RegisterDetails {
  email: string;
  password: string;
}

@customElement('register-route')
export class RegisterRoute extends LitElement {
  static get styles() {
    return css`
      .page {
        display: flex;
        flex-direction: column;
      }

      .form-structure {
        display: flex;
        flex-direction: column;
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
      if(!FirebaseService.auth) {
        throw new Error("Auth service is not initialised");
      }

      await createUserWithEmailAndPassword(
        FirebaseService.auth,
        event.detail.value.email,
        event.detail.value.password
      );
    } catch (error: any) {
      notificationService.instance?.addNotification({
        duration: 3000,
        content: "Failed to register",
        theme: "error"
      })
    }
  }



  render(): TemplateResult {
    return html`
      <div class="page">
        <span>
          To get access to some of the best features, you need an account. Sign
          up with an email and password below.
        </span>
        <user-credentials submitLabel="Register" @credentials-submit=${this.register}></user-credentials>
      </div>
    `;
  }
}
