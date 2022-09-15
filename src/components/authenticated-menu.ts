import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { User } from "firebase/auth";
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/tabs';

interface MenuItem {
  name: string;
  icon: string;
  href: string;
}

/// Create a single menu item
type MenuItemRenderer = (menuItem: MenuItem) => TemplateResult 

/// Menu definition indicating an ordered list of items per user authentication type 
type MenuDefinition = {
  user: MenuItem[],
  guest: MenuItem[]
}

/// Default menu definitions per authentication level.
const defaultMenu: MenuDefinition = {
  user: [
    {
      name: "Home",
      icon: "vaadin:dashboard",
      href: "/"
    }
  ],
  guest: [
    {
      name: "Home",
      icon: "vaadin:dashboard",
      href: "/"
    },
    {
      name: "Register",
      icon: "vaadin:clipboard-user",
      href: "/register"
    },
  ]
};

@customElement('authenticated-menu')
export class AuthenticatedMenu extends LitElement {
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

  /// Authenticated user ?? guest
  @property()
  user?: User;

  /// Defines the content of the menu
  @property()
  menuDefinition: MenuDefinition = defaultMenu;

  renderMenuItem: MenuItemRenderer = (menuItem) => {
    return html`
      <vaadin-tab>
        <a tabindex="-1" href="${ menuItem.href }">
            <vaadin-icon icon="${ menuItem.icon }"></vaadin-icon>
            <span>${ menuItem.name }</span>
        </a>
      </vaadin-tab>
    `;
  }

  items(): MenuItem[] {
    return this.user ? this.menuDefinition.user : this.menuDefinition.guest;
  }

  render(): TemplateResult {
    
    const menu: TemplateResult[] = this.items().map((item) => this.renderMenuItem(item) );

    return html`
        <vaadin-app-layout theme="small">
            <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
            <h1 slot="navbar">WarYes</h1>
            <vaadin-tabs slot="drawer" orientation="vertical">
                ${ menu }
            </vaadin-tabs>
            
            <slot></slot>
        </vaadin-app-layout>`;
  }
}
