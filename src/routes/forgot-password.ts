import { EmailField, EmailFieldInvalidChangedEvent, EmailFieldValueChangedEvent } from '@vaadin/email-field';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { notificationService } from '../services/notification';
import "@vaadin/email-field"
import "@vaadin/button";

@customElement('forgot-password-route')
export class ForgotPasswordRoute extends LitElement {
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

  @state()
  private email = '';

  @state ()
  private invalidEmail = true;

  @query("vaadin-email-field")
  private emailField!: EmailField;


  private async resetPassword() {
    const validity = this.emailField.checkValidity();

    if(!validity) {
      return;
    }

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, this.email)
      notificationService.instance?.addNotification({
        content: "If the email address is registered we'll send you a link to reset your password",
        theme: "success",
        duration: 5000
      });
    }
    catch(err) {
      console.log(err);
      notificationService.instance?.addNotification({
        content: "Unable to reset password",
        theme: "error",
        duration: 5000
      });

    }

  }

  render(): TemplateResult {
    return html`
      <div class="page">
        If you've forgotten your password you can reset it here. Type your email
        address in to the box below and if the email address has an account
        registered we'll send you a link to reset your password.

        <vaadin-email-field
          label="Email Address"
          clear-button-visible
          error-message="Enter a valid email address"
          @invalid-changed=${(event: EmailFieldInvalidChangedEvent) => {
            this.invalidEmail = event.detail.value;
          }}
          @value-changed=${(event: EmailFieldValueChangedEvent) => {
            this.email = event.detail.value;
          }}
        ></vaadin-email-field>
        <vaadin-button theme="primary" ?disabled=${this.invalidEmail || this.email == ""} @click=${() => {this.resetPassword()}}>Reset Password</vaadin-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'forgot-password-route': ForgotPasswordRoute;
  }
}
