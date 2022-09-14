import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {EmailFieldValueChangedEvent} from '@vaadin/email-field';
import {PasswordFieldValueChangedEvent} from '@vaadin/password-field';
import '@vaadin/email-field';
import '@vaadin/password-field';
import '@vaadin/button';
import '@vaadin/notification';
import '@vaadin/horizontal-layout';
import '@vaadin/icon';

export interface RegisterDetails {
  email: string;
  password: string;
}

export type CredentialsSubmitEvent = CustomEvent<{value: RegisterDetails}>;

/**
 * Form to capture user credentials, for login or for register
 */
@customElement('user-credentials')
export class UserCredentials extends LitElement {
  static get styles() {
    return css`
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
  submitLabel = "Submit";

  submit(event: Event) {
    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent('credentials-submit', {
        detail: { value: this.registerDetails },
        composed: true,
      })
    );
  }

  emailChanged(event: EmailFieldValueChangedEvent) {
    this.registerDetails.email = event.detail.value;
  }

  passwordChanged(event: PasswordFieldValueChangedEvent) {
    this.registerDetails.password = event.detail.value;
  }

  render(): TemplateResult {
    return html`
        <form class="form-structure" @submit=${this.submit}>
          <vaadin-email-field
            label="Email"
            @value-changed=${this.emailChanged}
          ></vaadin-email-field>
          <vaadin-password-field
            label="Password"
            @value-changed=${this.passwordChanged}
          ></vaadin-password-field>
          <vaadin-button theme="primary" @click=${this.submit}
            >${this.submitLabel}</vaadin-button
          >
          <input type="submit" hidden />
        </form>
      </div>
    `;
  }
}
