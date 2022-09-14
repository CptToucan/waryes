import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import {FirebaseService, FirebaseServiceClass} from '../services/firebase';
import '@vaadin/app-layout';
import '@vaadin/app-layout/vaadin-drawer-toggle';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/tabs';
import '../components/notification-manager';
import { NotificationController } from '../controllers/notification';

@customElement('application-route')
export class Application extends LitElement {
  static get styles() {
    return css`
      h1 {
        font-size: var(--lumo-font-size-l);
        margin: 0;
      }

      vaadin-icon {
        box-sizing: border-box;
        margin-inline-end: var(--lumo-space-m);
        margin-inline-start: var(--lumo-space-xs);
        padding: var(--lumo-space-xs);
      }
    `;
  }

  firebase: FirebaseServiceClass = FirebaseService;
  
  registeredNotification(event: CustomEvent) {
    const controller: NotificationController = event.detail.value;
    console.log(controller);
  }

  render(): TemplateResult {
    return html`
    <notification-manager @notification-controller-registered=${() => {console.log("Hello")}}></notification-manager>
    
    
    <vaadin-app-layout theme="small">
      <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
      <h1 slot="navbar">WarYes</h1>
      <vaadin-tabs slot="drawer" orientation="vertical">
        <vaadin-tab>
          <a tabindex="-1" href="/">
            <vaadin-icon icon="vaadin:dashboard"></vaadin-icon>
            <span>Home</span>
          </a>
        </vaadin-tab>
        <vaadin-tab>
          <a tabindex="-1" href="/register">
            <vaadin-icon icon="vaadin:clipboard-user"></vaadin-icon>
            <span>Register</span>
          </a>
        </vaadin-tab>
      </vaadin-tabs>
      <slot></slot>
    </vaadin-app-layout>`;
  }
}
