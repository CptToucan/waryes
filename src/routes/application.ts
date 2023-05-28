import { html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import {FirebaseService, FirebaseServiceClass} from '../services/firebase';
import { User } from "firebase/auth";
import '@vaadin/app-layout';
import '@vaadin/app-layout/vaadin-drawer-toggle';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/tabs';
import '../components/notification-manager';
import '../components/authenticated-menu';

@customElement('application-route')
export class Application extends LitElement {

  firebase: FirebaseServiceClass = FirebaseService;
  

  /**
   * loggedInUser states:
   * undefined = waiting for auth status
   * null      = not logged in
   * User      = logged in
   */
  @property()
  loggedInUser: User | null | undefined;

  constructor() {
    super();
    
    this.firebase.auth?.onAuthStateChanged((user) => {
      this.loggedInUser = user
    })
  }

  render(): TemplateResult {
    return html`
    <notification-manager></notification-manager>
    
    ${ this.loggedInUser !== undefined ? html`
        <authenticated-menu .user=${ this.loggedInUser }>
          <slot></slot>
        </authenticated-menu>` 
        : null
    }`;
  }
}
