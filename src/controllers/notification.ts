import { ReactiveController, ReactiveControllerHost } from 'lit';
import { notificationService, NotificationService } from '../services/notification';


interface notification {
  content: string;
  duration: number;
  theme: string;
}

/**
 * Responsible for managing notifications. Rendering is handled by the notification-manager component.
 */
class NotificationController implements ReactiveController {

  host: ReactiveControllerHost;
  service?: NotificationService

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    notificationService.register(this);
  }

  hostDisconnected() {
    notificationService.unregister(this);
  }
  
  notifications: notification[] = [];

  addNotification(notificationOptions: notification) {
    this.notifications.push(notificationOptions);
    this.host.requestUpdate();
  }
  
}

export {NotificationController};