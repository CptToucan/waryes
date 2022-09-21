import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import '@vaadin/email-field';
import '@vaadin/password-field';
import '@vaadin/button';
import '@vaadin/notification';
import '@vaadin/horizontal-layout';
import '@vaadin/icon';
import {FirebaseService} from '../services/firebase';
import {notificationService} from '../services/notification';
import {Router} from '@vaadin/router';
import { LoginFormLoginEvent } from '@vaadin/login/vaadin-login-form';


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
      }
    `;
  }

  @property()
  notificationOpened = false;

  @state()
  registrationError?: string;

  async register(event: LoginFormLoginEvent) {
    try {
      if (!FirebaseService.auth) {
        throw new Error('Auth service is not initialised');
      }

      await createUserWithEmailAndPassword(
        FirebaseService.auth,
        event.detail.username,
        event.detail.password
      );

      notificationService.instance?.addNotification({
        duration: 3000,
        content: 'Successfuly registered',
        theme: 'success',
      });

      Router.go('/');
    } catch (error: any) {
      console.error(error);
      this.registrationError = error.message ?? 'Failed to create an account';
    }
  }

  private i18n = () => { return {
    header: {
      title: 'Register',
      description: 'To get access to some of the best features, you need an account. Sign up with an email and password below.',
    },
    form: {
      title: 'Register',
      username: 'Username',
      password: 'Password',
      submit: 'Register',
      forgotPassword: '',
    },
    errorMessage: {
      title: 'There was a problem with your registration',
      message: this.registrationError ?? "",
    },
    additionalInformation: 'To get access to some of the best features, you need an account. Sign up with an email and password below.',
  }};

  render(): TemplateResult {
    return html`
      <div class="page">
        <vaadin-login-form 
          .i18n=${this.i18n()} 
          @login=${this.register} 
          ?error=${this.registrationError !== undefined} 
          no-forgot-password
          no-autofocus
        ></vaadin-login-form>
      </div>
    `;
  }
}
