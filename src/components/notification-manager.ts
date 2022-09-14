import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@vaadin/email-field';
import '@vaadin/password-field';
import '@vaadin/button';
import '@vaadin/notification';
import '@vaadin/horizontal-layout';
import '@vaadin/icon';
import {
  notificationRenderer,
  NotificationLitRenderer,
} from '@vaadin/notification/lit.js';
import '@vaadin/notification';
import { NotificationController } from '../controllers/notification';

@customElement('notification-manager')
export class NotificationManager extends LitElement {
  static get styles() {
    return css``;
  }

  notificationController: NotificationController;

  constructor() {
    super();
    this.notificationController = new NotificationController(this);
  }

  renderer: NotificationLitRenderer = (notification) => {
    return html`
      <vaadin-horizontal-layout
        theme="spacing"
        style="width: 100%; align-items: space-between;"
      >
        <div>${notification.getAttribute('data-content')}</div>
      </vaadin-horizontal-layout>
    `;
  };

  renderNotifications(): TemplateResult[] {
    const notificationRender: TemplateResult[] = [];

    for (const _notification of this.notificationController.notifications) {
      notificationRender.push(html` <vaadin-notification
        theme=${_notification.theme}
        duration=${_notification.duration}
        position="bottom-stretch"
        data-content=${_notification.content}
        .opened=${true}
        ${notificationRenderer(this.renderer, [])}
      ></vaadin-notification>`);
    }

    return notificationRender;
  }

  render(): TemplateResult {
    return html` ${this.renderNotifications()} `;
  }
}
