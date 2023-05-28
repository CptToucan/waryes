import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createUserWithEmailAndPassword, sendEmailVerification, updateProfile} from 'firebase/auth';
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
import { Router } from '@vaadin/router';

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
        margin: 0;
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

      const userCredential = await createUserWithEmailAndPassword(
        FirebaseService.auth,
        email,
        password
      );

      if (!userCredential.user) {
        throw new Error('User is not created');
      }

      await updateProfile(userCredential.user, {displayName});
      await sendEmailVerification(userCredential.user);

      Router.go("/");

      notificationService.instance?.addNotification({
        duration: 3000,
        content: 'Email verification sent. Please verify email before logging in.',
        theme: 'success',
      });

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
          <div>
            To allow voting and storing decks with WarYes, we require you to sign up for an account. 

            You can read our privacy policy here: <a href="/privacy-policy" target="_blank">Privacy Policy</a>
          </div>
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
            <div style="display: flex; justify-content: flex-end;">
            <vaadin-button
              theme="primary large"
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
