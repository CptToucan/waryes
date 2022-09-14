import { NotificationController } from "../controllers/notification";

/**
 * Singleton which stores the NotificationController, The controller attaches itself to the service when the . The NotificationController is attached to a notification-manager component,
 * there should only be 1 notification manager at a time.
 */
class NotificationService {
  private _instance: NotificationController | null = null;

  public get instance() {
    return this._instance;
  }

  public register(instance: NotificationController) {
    if(this.instance !== null) {
      throw new Error("A NotificationController is already registered. Please unregister the other NotificationController");
    }
    this._instance = instance;
  }

  public unregister(instance: NotificationController) {
    if(this._instance === instance) {
      this._instance = null;
    }
    else {
      throw new Error("The NotificationController you have tried to unregister is not registered. Please unregister the correct NotifcationController")
    }
  }

}

const notificationService = new NotificationService();
export {notificationService, NotificationService};
