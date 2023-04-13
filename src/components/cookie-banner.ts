import {Router} from '@vaadin/router';
import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('cookie-banner')
export class CookieBanner extends LitElement {
  private accepted = false;

  static get styles() {
    return css`
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: var(--lumo-contrast-10pct);
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--lumo-space-s) var(--lumo-space-m);

      }

      .cookie-text {
        font-size: 14px;
        line-height: 1.5;
        margin-right: 10px;
      }

      .cookie-buttons {
        display: flex;
        align-items: center;
        gap: var(--lumo-space-s);
      }

      .cookie-button.accept {
        background-color: #007bff;
        color: #fff;
      }
    `;
  }

  render() {
    if (this.accepted) {
      return html``;
    }

    return html`
      <div class="cookie-banner">
        <div class="cookie-text">
          This site uses cookies to improve your experience.
        </div>
        <div class="cookie-buttons">
          <vaadin-button @click=${this.handleAccept}> Accept </vaadin-button>
          <vaadin-button @click=${() => Router.go('/privacy-policy')}>
            Learn More
          </vaadin-button>
        </div>
      </div>
    `;
  }

  private handleAccept() {
    this.accepted = true;
    localStorage.setItem('cookiesAccepted', 'true');
  }

  connectedCallback() {
    super.connectedCallback();
    if (localStorage.getItem('cookiesAccepted') === 'true') {
      this.accepted = true;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cookie-banner': CookieBanner;
  }
}
