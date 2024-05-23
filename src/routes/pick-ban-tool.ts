import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {FirebaseService} from '../services/firebase';
import {BeforeEnterObserver} from '@vaadin/router';
import {User} from 'firebase/auth';
import {PickBanAdapter} from '../classes/PickBanAdapter';
import '../components/pick-ban/create-session';
import '../components/pick-ban/join-session';
import {PickBanConfigWithId} from '../types/PickBanTypes';
import {TabsSelectedChangedEvent} from '@vaadin/tabs';

@customElement('pick-ban-tool-route')
export class PickBanToolRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        padding: var(--lumo-space-s);
        align-items: center;
        flex-direction: column;
        flex: 1 1 100%;
        height: 100%;
        box-sizing: border-box;
      }

      h1,
      p {
        margin: 0;
        margin-bottom: var(--lumo-space-m);
      }

      .container {
        margin-top: var(--lumo-space-m);
        display: flex;
        flex-direction: column;
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-m);
        width: 100%;
        max-width: 800px;
        max-width: min(800px, 100%);
        box-sizing: border-box;
      }

      .logo {
        margin-top: var(--lumo-space-m);
        max-width: 100%;
        width: 600px;
      }
    `;
  }

  @state()
  loggedInUser: User | null | undefined;

  @state()
  mode?: 'create' | 'join';

  @state()
  selectedTabIndex = 0;

  selectedTabChanged(e: TabsSelectedChangedEvent) {
    const tabIndex = e.detail.value;
    this.selectedTabIndex = tabIndex;
  }

  async onBeforeEnter() {
    FirebaseService.auth?.onAuthStateChanged(async (user) => {
      this.loggedInUser = user;
    });

    const configs = await PickBanAdapter.loadAvailableConfigs();

    this.configs = configs;
  }

  configs: PickBanConfigWithId[] = [];

  renderWelcome() {
    return html`<h3>What is General's Mode?</h3>
      <p>General's mode is a turn-based pick and ban tool. It has predefined rulesets that can be configured by trusted members for upcoming tournaments or Warno sessions.</p>
      <p>It allows picking and banning both maps and divisions, with the ability to customise the pools of maps and divisions.</p>
      <p>It allows different modes:</p>
      <ul>
        <li>NATO v PACT: This comes with a pick for NATO or PACT</li>
        <li>NATO v NATO</li>
        <li>PACT v PACT</li>
        <li>ALL v ALL</li>
      </ul>
    `;
  }

  renderHost() {
    if (!this.loggedInUser) {
      return html`
        <p>Please log in to use the Pick Ban Tool</p> `;
    }

    return html`
      <pick-ban-create-session
        .loggedInUser=${this.loggedInUser}
        .configs=${this.configs}
      ></pick-ban-create-session>
    `;
  }

  renderJoin() {
    if (!this.loggedInUser) {
      return html`
        <p>Please log in to use the Pick Ban Tool</p> `;
    }

    return html` <pick-ban-join-session></pick-ban-join-session> `;
  }

  renderSpectate() {
    return html`Spectate`;
  }

  render(): TemplateResult {
    const tabs = ['Welcome', 'Host', 'Join', 'Spectate'];

    let tabContent = html``;
    switch (this.selectedTabIndex) {
      case 0:
        tabContent = this.renderWelcome();
        break;
      case 1:
        tabContent = this.renderHost();
        break;
      case 2:
        tabContent = this.renderJoin();
        break;
      case 3:
        tabContent = this.renderSpectate();
        break;
    }

    return html`
      <img
        class="logo"
        src="/waryes-2024-pick-ban.png"
        alt="Waryes 2024 Pick Ban Tool"
      />
      <div class="container">
        <vaadin-tabs @selected-changed="${this.selectedTabChanged}">
          ${tabs.map((tab) => html`<vaadin-tab>${tab}</vaadin-tab>`)}
        </vaadin-tabs>

        <div class="content">${tabContent}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-tool-route': PickBanToolRoute;
  }
}
