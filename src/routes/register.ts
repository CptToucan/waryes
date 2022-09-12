import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@vaadin/email-field';
import '@vaadin/password-field';

@customElement('register-route')
export class RegisterRoute extends LitElement {
  static get styles() {
    return css`
      .page {
        display: flex;
        flex-direction: column;
      }
    `;
  }

  register() {}

  render(): TemplateResult {
    return html`
      <div class="page">
        <span>
          To get access to some of the best features, you need an account. Sign
          up with an email and password below.
        </span>

        <vaadin-email-field theme="dark" label="Email"></vaadin-email-field>
        <vaadin-password-field theme="dark" label="Password"></vaadin-password-field>
      </div>
    `;
  }
}
