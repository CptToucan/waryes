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
import { MenuItem, MenuGroup } from '../routes/index';

/// Create a single menu item
type MenuItemRenderer = (
  menuItem: MenuGroup | MenuItem
) => TemplateResult;

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
  menu: MenuGroup[] = [];


  @state()
  activeUrl = '/';

  unitSelected(event: CustomEvent) {
    if (event.detail.value as Unit) {
      Router.go(`/unit/${event.detail.value?.descriptorName}`);
    }
  }

  renderMenuItem: MenuItemRenderer = (menuItem: MenuItem | MenuGroup) => {


    if (isMenuItemGroup(menuItem)) {
      return html`<div class="menu-item-group">${menuItem.title}</div>
        ${menuItem.items.map((item) => this.renderMenuItem(item))}`;
    } else {

      const isAuthenticated = this.user != undefined;
      const menuItemRequiresAuth = menuItem.authenticated;

      if (menuItemRequiresAuth && !isAuthenticated) {
        return html``;
      }

      const activePath = this.activeUrl;
      const selected = activePath === menuItem.link;
      return html` <a
        class="tab ${selected ? 'selected' : ''}"
        href=${menuItem.link}
      >
        <vaadin-icon class="drawer-icon" icon=${menuItem.logo}> </vaadin-icon>
        <div class="menu-item">${menuItem.title}</div>
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
    this.activeUrl = activePath || '/';
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
    const menu: TemplateResult[] = this.menu.map((item) => {
      return this.renderMenuItem(item);
    });

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
  menuItem: MenuItem | MenuGroup
): menuItem is MenuGroup {
  return (menuItem as MenuGroup).items !== undefined;
}
