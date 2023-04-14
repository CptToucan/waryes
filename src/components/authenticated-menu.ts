import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {User, getAuth, signOut, sendEmailVerification} from 'firebase/auth';
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
// import {ifDefined} from 'lit/directives/if-defined.js';
import {Features, featureService} from '../services/features';
import {Unit} from '../types/unit';
import './verify-email';
interface MenuItem {
  name: string;
  icon: string;
  href: string;
}

interface MenuItemGroup {
  name: string;
  items: MenuItem[];
}

/// Create a single menu item
type MenuItemRenderer = (menuItem: MenuItem | MenuItemGroup, selected?: boolean) => TemplateResult;

/// Menu definition indicating an ordered list of items per user authentication type
type MenuDefinition = {
  user: (MenuItem | MenuItemGroup)[];
  guest: (MenuItem | MenuItemGroup)[];
};

/// Default menu definitions per authentication level.
const defaultMenu: MenuDefinition = {
  user: [
    {
      name: 'Units',
      items: [
        {
          name: 'Search',
          icon: 'vaadin:search',
          href: '/',
        },
        {
          name: 'Database',
          icon: 'vaadin:table',
          href: '/units',
        },
        {
          name: 'Comparison',
          icon: 'vaadin:pie-bar-chart',
          href: '/comparison',
        },
      ],
    },
    {
      name: 'Decks',
      items: [
        {
          name: 'Build',
          icon: 'vaadin:tools',
          href: '/deck-builder',
        },
        {
          name: 'Import',
          icon: 'vaadin:code',
          href: '/deck-import',
        },
        {
          name: 'Library',
          icon: 'vaadin:book',
          href: '/deck-library',
        },
        {
          name: 'My Decks',
          icon: 'vaadin:folder',
          href: '/my-decks',
        },
      ],
    },
    {
      name: 'Information',
      items: [
        {
          name: 'Discord',
          icon: 'vaadin:comments',
          href: 'https://discord.gg/gqBgvgGj8H',
        },
        {
          name: 'Privacy Policy',
          icon: 'vaadin:file-text',
          href: '/privacy-policy',
        },
      ],
    },
  ],
  guest: [
    {
      name: 'Units',
      items: [
        {
          name: 'Search',
          icon: 'vaadin:search',
          href: '/',
        },
        {
          name: 'Database',
          icon: 'vaadin:table',
          href: '/units',
        },
        {
          name: 'Comparison',
          icon: 'vaadin:pie-bar-chart',
          href: '/comparison',
        },
      ],
    },
    {
      name: 'Decks',
      items: [
        {
          name: 'Build',
          icon: 'vaadin:tools',
          href: '/deck-builder',
        },
        {
          name: 'Import',
          icon: 'vaadin:code',
          href: '/deck-import',
        },
        {
          name: 'Library',
          icon: 'vaadin:book',
          href: '/deck-library',
        },
      ],
    },
    {
      name: 'Information',
      items: [
        {
          name: 'Discord',
          icon: 'vaadin:comments',
          href: 'https://discord.gg/gqBgvgGj8H',
        },
        {
          name: 'Privacy Policy',
          icon: 'vaadin:file-text',
          href: '/privacy-policy',
        },
      ],
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
        gap: var(--lumo-space-m);
      }

      unit-search {
        flex: 1 1 0px;
        max-width: 256px;
        min-width: 0px;
        width: 0;
      }

      a.logo {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @media (max-width: 640px) {
        .desktop-only {
          display: none;
        }

        a.logo {
          display: none;
        }
      }

      .tabs {
        display: flex;
        flex-direction: column;
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
      }

      a.tab {
        display: flex;
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
        text-decoration: none; /* no underline */
        color: var(--lumo-body-text-color);
      }

      a.tab:hover {
        background-color: var(--lumo-contrast-10pct);
      }

      a.tab:active {
        background-color: var(--lumo-primary-color-10pct);
        color: var(--lumo-primary-color);
      }

      a.tab.selected {
        background-color: var(--lumo-primary-color-10pct);
        color: var(--lumo-primary-color);
      }

      .menu-item-group {
        padding-left: var(--lumo-space-s);
        padding-right: var(--lumo-space-s);
        padding-top: var(--lumo-space-xs);
        padding-bottom: var(--lumo-space-xs);
        font-size: var(--lumo-font-size-l);
        // color: var(--lumo-primary-color);
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

  @state()
  activeUrl = "/";



  unitSelected(event: CustomEvent) {
    if (event.detail.value as Unit) {
      Router.go(`/unit/${event.detail.value?.descriptorName}`);
    }
  }

  renderMenuItem: MenuItemRenderer = (menuItem: MenuItem | MenuItemGroup) => {
    if (isMenuItemGroup(menuItem)) {
      return html`<div class="menu-item-group">${menuItem.name}</div>
        ${menuItem.items.map((item) => this.renderMenuItem(item))}`;
    } else {
      const activePath = this.activeUrl;
      const selected = activePath === menuItem.href;
      return html` <a class="tab ${selected ? "selected" : "" }" href=${menuItem.href}>
        <vaadin-icon class="drawer-icon" icon=${menuItem.icon}> </vaadin-icon>
        <div class="menu-item">${menuItem.name}</div>
      </a>`;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    this.handlePopState();
    this.handlePopState = this.handlePopState.bind(this);
    window.addEventListener('popstate', this.handlePopState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.handlePopState);
  }

  handlePopState() {
    const activePath = router.location?.route?.path;
    this.activeUrl = activePath || "/";
  }

  items(): (MenuItem | MenuItemGroup)[] {
    return this.user ? this.menuDefinition.user : this.menuDefinition.guest;
  }

  getLoggedInContextMenuItems(): ContextMenuItem[] {
    const isEmailVerified = this.user?.emailVerified;
    const items = [];

    if (!isEmailVerified) {
      items.push({text: 'Verify Email'});
    }

    items.push({text: 'Settings'});

    items.push({text: 'Logout'});
    return items;
  }

  async contextMenuItemSelected(event: ContextMenuItemSelectedEvent) {
    if (event.detail.value.text === 'Settings') {
      Router.go('/user-settings');
    }

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

    if (event.detail.value.text === 'Verify Email') {
      const auth = getAuth();
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        notificationService.instance?.addNotification({
          duration: 3000,
          content: 'Verification email sent',
          theme: 'success',
        });
      } else {
        notificationService.instance?.addNotification({
          duration: 3000,
          content: 'Failed to send verification email',
          theme: 'error',
        });
      }
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
          <span class="desktop-only">
            ${this.user.displayName ? this.user.displayName : 'NO DISPLAY NAME'}
          </span>

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
  }

  render(): TemplateResult {
    const menu: TemplateResult[] = this.items().map((item, index) => {
      let selected = false;
      if (index === this.selectedMenuItemIndex) {
        selected = true;
      }

      return this.renderMenuItem(item, selected);}
    );

    const shouldMakeUserVerify =
      this.user && this.user?.emailVerified === false;

    return html` <vaadin-app-layout
      style="height: 100%; --vaadin-app-layout-drawer-overlay: true"
      theme="small"
      .drawerOpened=${false}
    >
      <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
      <div class="navbar-layout" slot="navbar">
        <div class="left-navbar">
          <a class="logo" href="/">
            <img height="32" src=${WaryesImage} />
          </a>

          <unit-search @unit-selected=${this.unitSelected}></unit-search>
        </div>

        ${featureService.enabled(Features.firebase_auth)
          ? this.renderAccountButton()
          : ''}
      </div>
      <div class="drawer" slot="drawer">
        <div class="tabs">${menu}</div>
      </div>

      ${shouldMakeUserVerify
        ? html`<verify-email></verify-email>`
        : html`<slot></slot>`}
    </vaadin-app-layout>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'authenticated-menu': AuthenticatedMenu;
  }
}

function isMenuItemGroup(
  menuItem: MenuItem | MenuItemGroup
): menuItem is MenuItemGroup {
  return (menuItem as MenuItemGroup).items !== undefined;
}

/*
        <vaadin-tabs
          orientation="vertical"
          selected=${ifDefined(this.selectedMenuItemIndex)}
        >
          ${menu}
        </vaadin-tabs>

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
    */
