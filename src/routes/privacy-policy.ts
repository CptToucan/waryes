import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('privacy-policy-route')
export class PrivacyPolicyRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: center;
        padding: var(--lumo-space-s);
      }

      .page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        max-width: 800px;
        margin: 0 auto; /* Center the container horizontally */
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-m);
        border-radius: var(--lumo-border-radius);
      }

      h2 {
        margin: 0;
      }
    `;
  }

  render(): TemplateResult {
    return html`
      <div class="page">
        <h1>Privacy Policy for WarYes</h1>

        <p>
          This Privacy Policy governs the manner in which WarYes collects, uses,
          maintains, and discloses information collected from users (each, a
          "User") of the war-yes.com website ("Site"). This privacy policy
          applies to the Site and all products and services offered by WarYes.
        </p>
        <h2>Personal identification information</h2>

        <p>
          We may collect personal identification information from Users in a
          variety of ways, including but not limited to when Users visit our
          site, register on the site, and in connection with other activities,
          services, features, or resources we make available on our Site. Users
          may be asked for, as appropriate, email address, password, and a
          display name. We will collect personal identification information from
          Users only if they voluntarily submit such information to us. Users
          can always refuse to supply personally identification information,
          except that it may prevent them from engaging in certain Site-related
          activities.
        </p>
        <h2>Non-personal identification information</h2>

        <p>We don't collect any non-personal identification information.</p>
        <h2>Web browser cookies</h2>

        <p>
          WarYes uses your browser's local storage to save the mod databases
          that you are browsing the site with.
        </p>
        <h2>How we use collected information</h2>

        WarYes may collect and use Users' personal information for the following
        purposes:
        <ul>
          <li>
            To store and display user-generated content: We use the deck codes
            that Users create and store on our Site to display them to other
            Users and to facilitate sharing of these codes.
          </li>
          <li>
            To generate statistics about deck usage: We analyze deck code usage
            to generate statistics about deck popularity, card usage, and other
            trends in the Warno game community.
          </li>
          <li>
            To send periodic emails: We may use the email address to respond to
            inquiries, questions, and/or other requests.
          </li>
        </ul>

        <h2>Plausible Analytics</h2>
        <p>
          At war-yes.com, we use Plausible Analytics, a privacy-first web
          analytics tool, to analyze overall trends in website traffic.
          Plausible Analytics does not track individuals across devices or
          websites, ensuring user privacy. Plausible Analytics does not use
          cookies, generate persistent identifiers, or collect any personal or
          identifiable data. The data collected is limited to a single day, a
          single website, and a single device. It is completely anonymous and
          aggregated, containing no personal information. Our use of Plausible
          Analytics is focused on measuring essential data points to improve our
          services. We do not track individual visitors or collect any
          personally identifiable information.
        </p>

        <h2>Data Retention</h2>
        <p>
          WarYes will retain user data, including personal information and deck
          codes, for as long as the user maintains an account with us. Upon
          request or account deletion, WarYes will remove all personal
          information and data associated with the account. This includes any
          user-generated content, such as deck codes, that may have been stored
          on our Site. Please note that once this information is deleted, it
          cannot be recovered.
        </p>

        <h2>How we protect your information</h2>

        <p>
          We adopt appropriate data collection, storage, and processing
          practices and security measures to protect against unauthorized
          access, alteration, disclosure or destruction of your personal
          information, email address, password, and data stored on our Site.
        </p>
        <h2>Sharing your personal information</h2>

        <p>
          We do not sell, trade, or rent Users' personal identification
          information to others.
        </p>
        <h2>Use of Google Firebase</h2>

        <p>
          We use Google Firebase to store User data. Firebase is a platform that
          provides various services to app and website developers, including
          cloud storage and database services. By using our Site, you
          acknowledge and agree that your personal information and deck codes
          will be stored with Firebase and subject to Google's privacy policy,
          which can be found here: https://policies.google.com/privacy Please
          note that we cannot guarantee that Google will not share the data
          stored in Firebase, as their privacy policy and terms of service may
          allow them to share user data under certain circumstances.
        </p>
        <h2>Changes to this privacy policy</h2>

        <p>
          WarYes has the discretion to update this privacy policy at anytime. We
          encourage Users to frequently check this page for any changes to stay
          informed about how we are helping to protect the personal information
          we collect. You acknowledge and agree that it is your responsibility
          to review this privacy policy periodically and become aware of
          modifications.
        </p>

        <h2>Your acceptance of these terms</h2>

        <p>
          By using this Site, you signify your acceptance of this policy. If you
          do not agree to this policy, please do not use our Site. Your
          continued use of the Site following the posting of changes to this
          policy will be deemed your acceptance of those changes.
        </p>

        <h2>Your right to complaint</h2>

        <p>
          If you wish to complain to a supervisory authority, you can do so by
          complaining to the ICO in the UK. You can find out more about your
          rights and how to complain to the ICO here:
          https://ico.org.uk/concerns/
        </p>

        <h2>Contacting us</h2>

        <p>
          If you have any questions about this Privacy Policy, the practices of
          this site, or your dealings with this site, please contact us at
          support@war-yes.com.
        </p>
        <p>This document was last updated on June 28, 2023.</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'privacy-policy-route': PrivacyPolicyRoute;
  }
}
