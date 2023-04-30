import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import '@vaadin/login/vaadin-login-form';
import {LoginFormLoginEvent, LoginI18n} from '@vaadin/login/vaadin-login-form';
import '@vaadin/button';
import {Router} from '@vaadin/router';
import {notificationService} from '../services/notification';

interface RegisterDetails {
  email: string;
  password: string;
}

@customElement('login-route')
export class LoginRoute extends LitElement {
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

      .separator {
        border-top: 1px solid var(--lumo-contrast-20pct);
        position: relative;
        height: 15px;
        text-align: center;
        font-size: 84%;
        margin-left: var(--lumo-space-m);
        margin-right: var(--lumo-space-m);
      }

      .text-separator {
        padding: 0 0.5em;
        position: relative;
        color: var(--lumo-secondary-text-color);
        top: -0.7em;
        border-radius: 3px;
      }

      .sign-up {
        padding-left: var(--lumo-space-l);
        padding-right: var(--lumo-space-l);
        padding-bottom: var(--lumo-space-l);
        padding-top: var(--lumo-space-s);
        display: flex;
        flex-direction: column;
      }

      .link-button {
        cursor: var(--lumo-clickable-cursor);
        text-decoration: none;
        display: flex;
        justify-content: center;
        align-items: center;
        --lumo-button-size: var(--lumo-size-m);
        min-width: calc(var(--lumo-button-size) * 2);
        height: var(--lumo-button-size);
        padding: 0
          calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius-m) / 2);
        margin: var(--lumo-space-xs) 0;
        box-sizing: border-box;
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size-m);
        font-weight: 500;
        color: var(--_lumo-button-color, var(--lumo-primary-text-color));
        background-color: var(
          --_lumo-button-background-color,
          var(--lumo-contrast-5pct)
        );
        border-radius: var(--lumo-border-radius-m);
        cursor: var(--lumo-clickable-cursor);
      }
    `;
  }

  registerDetails: RegisterDetails = {
    email: '',
    password: '',
  };

  @property()
  notificationOpened = false;


  @state()
  loginError = false;

  async login(event: LoginFormLoginEvent) {

    this.loginError = false;
    
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, event.detail.username, event.detail.password);

      notificationService.instance?.addNotification({
        duration: 3000,
        content: "Logged in",
        theme: 'success',
      });
      Router.go("/");
    }
    catch(error: any) {
      console.error(error);
      this.loginError = true;
    }
  }

  loginI18n: LoginI18n = {
    form: {
      title: 'Sign in',
      username: 'Email Address',
      password: 'Password',
      submit: 'Sign in',
      forgotPassword: 'Forgot password',
    },
    errorMessage: {
      title: 'Incorrect username or password',
      message: 'Check that you have entered the correct username and password and try again.',
    },
    header: {
      title: 'Login to WarYes',
    }
  };


  render(): TemplateResult {
    return html`
      <div class="page">
        <vaadin-login-form
          .i18n=${this.loginI18n}
          no-autofocus
          @login=${this.login}
          @forgot-password=${() => Router.go('/forgot-password')}
          ?error=${this.loginError}
        ></vaadin-login-form>

        <div class="separator"><span class="text-separator">OR</span></div>

        <div class="sign-up">
          <vaadin-button
            theme="secondary"
            @click=${() => Router.go('/register')}
            >Sign up</vaadin-button
          >
        </div>
      </div>
    `;
  }
}
