import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import '@vaadin/email-field';
import '@vaadin/password-field';
import '@vaadin/button';
import '@vaadin/notification';
import '@vaadin/horizontal-layout';
import '@vaadin/icon';
import type {FormLayoutResponsiveStep} from '@vaadin/form-layout';
import '@vaadin/form-layout';

import {FirebaseService} from '../services/firebase';
import {notificationService} from '../services/notification';
import {Router} from '@vaadin/router';

@customElement('register-route')
export class RegisterRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: center;
        padding: var(--lumo-space-l);
      }

      h2 {
        color: var(--lumo-contrast);
      }

      .card {
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--lumo-space-l);
      }
    `;
  }

  private responsiveSteps: FormLayoutResponsiveStep[] = [
    // Use one column by default
    {minWidth: 0, columns: 1},
  ];

  @property()
  notificationOpened = false;

  @state()
  registrationError?: string;

  private email = '';
  private displayName = '';
  private password = '';

  private _onEmailChange(event: CustomEvent) {
    this.email = event.detail.value;
  }

  private _onDisplayNameChange(event: CustomEvent) {
    this.displayName = event.detail.value;
  }

  private _onPasswordChange(event: CustomEvent) {
    this.password = event.detail.value;
  }

  async register({
    email,
    password,
    displayName,
  }: {
    email: string;
    password: string;
    displayName: string;
  }) {
    this.registrationError = undefined;

    try {
      if (!FirebaseService.auth) {
        throw new Error('Auth service is not initialised');
      }
      console.log(email, password, displayName);

      const userCredential = await createUserWithEmailAndPassword(
        FirebaseService.auth,
        email,
        password
      );

      if (!userCredential.user) {
        throw new Error('User is not created');
      }

      await updateProfile(userCredential.user, {displayName});



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

  render(): TemplateResult {
    return html`
      <div class="card">
        <h2>Register</h2>
        <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}">
          <vaadin-email-field
            label="Email address"
            name="email"
            @value-changed=${this._onEmailChange}
            error-message="Enter a valid email address"
            clear-button-visible
            ?required=${true}
          ></vaadin-email-field>

          <vaadin-text-field
            label="Display Name"
            name="displayName"
            @value-changed=${this._onDisplayNameChange}
            clear-button-visible
            ?required=${true}
          ></vaadin-text-field>

          <vaadin-password-field
            label="Password"
            name="password"
            @value-changed=${this._onPasswordChange}
            error-message="Password must be at least 8 characters long"
            clear-button-visible
            ?required=${true}
          ></vaadin-password-field>
          <div>
            <vaadin-button
              theme="primary"
              @click=${() => {
                this.register({
                  email: this.email,
                  password: this.password,
                  displayName: this.displayName,
                });
              }}
              >Register</vaadin-button
            >
          </div>
        </vaadin-form-layout>
      </div>
    `;
  }
}

/*
        <vaadin-login-form 
          .i18n=${this.i18n()} 
          @login=${this.register} 
          ?error=${this.registrationError !== undefined} 
          no-forgot-password
          no-autofocus
        ></vaadin-login-form>
      */
