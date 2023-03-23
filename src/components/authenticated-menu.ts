import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {User, getAuth, signOut} from 'firebase/auth';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/tabs';
import '@vaadin/context-menu';
import '@vaadin/app-layout';
import {Router} from '@vaadin/router';
import {
  ContextMenuItem,
  ContextMenuItemSelectedEvent,
} from '@vaadin/context-menu';
import {notificationService} from '../services/notification';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import {router} from '../services/router';
import {ifDefined} from 'lit/directives/if-defined.js';
import {Features, featureService} from '../services/features';
import {Unit} from '../types/unit';
interface MenuItem {
  name: string;
  icon: string;
  href: string;
}

/// Create a single menu item
type MenuItemRenderer = (menuItem: MenuItem) => TemplateResult;

/// Menu definition indicating an ordered list of items per user authentication type
type MenuDefinition = {
  user: MenuItem[];
  guest: MenuItem[];
};

/// Default menu definitions per authentication level.
const defaultMenu: MenuDefinition = {
  user: [
    {
      name: 'Search',
      icon: 'vaadin:search',
      href: '/',
    },
    {
      name: 'Units',
      icon: 'vaadin:table',
      href: '/units',
    },
    {
      name: 'Comparison',
      icon: 'vaadin:pie-bar-chart',
      href: '/comparison',
    },
    {
      name: 'Deck Builder',
      icon: 'vaadin:tools',
      href: '/deck-builder',
    },
    {
      name: 'Import Deck',
      icon: 'vaadin:code',
      href: '/deck-import',
    },
    {
      name: 'Deck Library',
      icon: 'vaadin:folder',
      href: '/deck-library',
    },
    {
      name: 'Discord',
      icon: 'vaadin:comments',
      href: 'https://discord.gg/gqBgvgGj8H',
    },
  ],
  guest: [
    {
      name: 'Search',
      icon: 'vaadin:search',
      href: '/',
    },
    {
      name: 'Units',
      icon: 'vaadin:table',
      href: '/units',
    },
    {
      name: 'Comparison',
      icon: 'vaadin:pie-bar-chart',
      href: '/comparison',
    },
    {
      name: 'Deck Builder',
      icon: 'vaadin:tools',
      href: '/deck-builder',
    },
    {
      name: 'Import Deck',
      icon: 'vaadin:code',
      href: '/deck-import',
    },
    {
      name: 'Deck Library',
      icon: 'vaadin:folder',
      href: '/deck-library',
    },

    {
      name: 'Discord',
      icon: 'vaadin:comments',
      href: 'https://discord.gg/gqBgvgGj8H',
    },
  ],
};

@customElement('authenticated-menu')
export class AuthenticatedMenu extends LitElement {
  static get styles() {
    return css`
      h1 {
        font-size: var(--lumo-font-size-l);
        margin: 0;
      }

      vaadin-icon.drawer-icon {
        box-sizing: border-box;
        margin-inline-end: var(--lumo-space-m);
        margin-inline-start: var(--lumo-space-xs);
        padding: var(--lumo-space-xs);
      }

      .navbar-layout {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        justify-content: space-between;
        padding-right: var(--lumo-space-s);

        :host {
          display: flex;
          flex-direction: column;
          flex: 1 1 0;
        }
      }

      .left-navbar {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex: 1 1 0;
        overflow: hidden;
      }

      unit-search {
        margin-left: var(--lumo-space-m);
        flex: 1 1 0px;
        max-width: 256px;
        min-width: 0px;
        width: 0;
      }
    `;
  }

  /// Authenticated user ?? guest
  @property()
  user?: User;

  /// Defines the content of the menu
  @property()
  menuDefinition: MenuDefinition = defaultMenu;

  @state()
  selectedMenuItemIndex?: number;

  unitSelected(event: CustomEvent) {
    if (event.detail.value as Unit) {
      Router.go(`/unit/${event.detail.value?.descriptorName}`);
    }
  }

  renderMenuItem: MenuItemRenderer = (menuItem) => {
    return html`
      <vaadin-tab>
        <a tabindex="-1" href="${menuItem.href}">
          <vaadin-icon
            class="drawer-icon"
            icon="${menuItem.icon}"
          ></vaadin-icon>
          <span>${menuItem.name}</span>
        </a>
      </vaadin-tab>
    `;
  };

  firstUpdated() {
    const activePath = router.location?.route?.path;

    if (activePath) {
      const menuItems = this.items();
      const foundIndex = menuItems.findIndex(
        (item) => item.href === activePath
      );
      this.selectedMenuItemIndex = foundIndex;
    }
  }

  items(): MenuItem[] {
    return this.user ? this.menuDefinition.user : this.menuDefinition.guest;
  }

  getLoggedInContextMenuItems(): ContextMenuItem[] {
    return [{text: 'Logout'}];
  }

  async contextMenuItemSelected(event: ContextMenuItemSelectedEvent) {
    if (event.detail.value.text === 'Logout') {
      const auth = getAuth();
      await signOut(auth);
      Router.go('/login');

      notificationService.instance?.addNotification({
        duration: 3000,
        content: 'Successfully logged out',
        theme: 'success',
      });
    }
  }

  renderAccountButton(): TemplateResult {
    if (this.user) {
      return html` <vaadin-context-menu
        @item-selected=${this.contextMenuItemSelected}
        open-on="click"
        .items=${this.getLoggedInContextMenuItems()}
      >
        <vaadin-button theme="tertiary" aria-label="Account">
          <vaadin-icon icon="vaadin:user"></vaadin-icon>
        </vaadin-button>
      </vaadin-context-menu>`;
    } else {
      return html` <vaadin-button
        theme="tertiary"
        aria-label="Sign in"
        @click=${() => {
          Router.go('/login');
        }}
      >
        <vaadin-icon icon="vaadin:sign-in"></vaadin-icon>
      </vaadin-button>`;
    }
    return html``;
  }

  render(): TemplateResult {
    const menu: TemplateResult[] = this.items().map((item) =>
      this.renderMenuItem(item)
    );

    return html` <vaadin-app-layout
      style="height: 100%; --vaadin-app-layout-drawer-overlay: true"
      theme="small"
      .drawerOpened=${false}
    >
      <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
      <div class="navbar-layout" slot="navbar">
        <div class="left-navbar">
          <img height="32" src=${WaryesImage} />
          <unit-search @unit-selected=${this.unitSelected}></unit-search>
        </div>

        ${featureService.enabled(Features.firebase_auth)
          ? this.renderAccountButton()
          : ''}
      </div>
      <div class="drawer" slot="drawer">
        <vaadin-tabs
          orientation="vertical"
          selected=${ifDefined(this.selectedMenuItemIndex)}
        >
          ${menu}
        </vaadin-tabs>
      </div>

      <slot></slot>
    </vaadin-app-layout>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'authenticated-menu': AuthenticatedMenu;
  }
}

