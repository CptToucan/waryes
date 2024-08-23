import {css, html, LitElement, TemplateResult /*, unsafeCSS*/} from 'lit';
import {customElement, state} from 'lit/decorators.js';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
// @ts-ignore
import WarnoImage from '../../images/warno.png';
// @ts-ignore
import FragoImage from '../../images/frago-transparent.png';
// @ts-ignore
import WarnoLetLooseImage from '../../images/warno-let-loose-transparent.png';
import '@vaadin/multi-select-combo-box';
import '@vaadin/combo-box';
import '@vaadin/checkbox-group';
import '@vaadin/checkbox';
import '../components/mod-image';

import '../components/unit-search';
import {Unit} from '../types/unit';
import {BeforeEnterObserver, Router} from '@vaadin/router';
import {StrapiAdapter} from '../classes/StrapiAdapter';
import {ifDefined} from 'lit/directives/if-defined.js';

export interface MenuItem {
  title: string;
  logo: string;
  link: string;
  authenticated: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@customElement('index-route')
export class IndexRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`
      :host {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .splash {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: var(--lumo-space-m);
      }

      h2 {
        margin: 0;
      }

      .search {
        align-self: stretch;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-left: var(--lumo-space-xs);
        padding-right: var(--lumo-space-xs);
        min-width: 320px;
      }

      unit-search {
        flex: 1 1 0;
        max-width: 512px;
        margin-top: var(--lumo-space-m);
        margin-bottom: var(--lumo-space-m);
      }

      .or {
        font-size: var(--lumo-font-size-l);
        padding-top: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
      }

      button {
        all: unset;
        cursor: pointer;
      }

      .container {
        // height: 100%;
        display: flex;
        flex-direction: column;
      }

      .button-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--lumo-space-xs);
        max-width: 800px;
        overflow: hidden;
        width: 100%;
        margin-left: var(--lumo-space-s);
        margin-right: var(--lumo-space-s);
      }

      .button-category {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      a.choice-button {
        border-radius: var(--lumo-border-radius-m);
        padding: var(--lumo-space-xs);
        background-color: var(--lumo-contrast-5pct);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-direction: column;
        color: var(--lumo-contrast-80pct);
        border: 2px solid transparent;
        font-size: var(--lumo-font-size-xs);
        height: var(--lumo-size-xxl);
        text-align: center;
        text-decoration: none;
        user-select: none;
        flex: 1 1 100%;
        height: 110px;
        transition: background-color 0.3s ease;
      }

      .headline {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--lumo-space-s);
        padding-top: var(--lumo-space-s);
        padding-bottom: var(--lumo-space-s);
        height: 100%;
        justify-content: space-around;
      }

      .socials {
        display: flex;
        justify-content: center;
        gap: var(--lumo-space-m);
        margin-top: var(--lumo-space-l);
        padding-top: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
        flex-wrap: wrap;
      }

      .social {
        display: flex;
        flex-direction: column;
        width: 256px;
      }

      .social img {
        margin-bottom: var(--lumo-space-m);
      }

      .social div {
        text-align: center;
      }

      a {
        text-decoration: none;
      }

      a:visited {
        color: var(--lumo-body-text-color);
      }

      a.choice-button.disabled {
        opacity: 0.4;
        cursor: unset;
      }

      a.choice-button vaadin-icon {
        color: var(--lumo-primary-color);
      }

      a.choice-button span {
        color: var(--lumo-contrast-60pct);
      }

      a.choice-button.disabled:hover {
        background-color: var(--lumo-contrast-5pct);
      }

      a.choice-button:hover {
        background-color: var(--lumo-contrast-10pct);
      }

      a:focus {
        border: 2px solid var(--lumo-primary-color-50pct);
      }

      .bmc {
        background-color: var(--lumo-contrast-5pct);
        color: white;
        border-radius: 8px;
        padding-left: 8px;
        padding-right: 8px;
      }

      h3 {
        margin: 0;
      }
    `;
  }

  @state()
  private menuGroups: MenuGroup[] = [];

  @state()
  private homepageLogoDetails?: {
    link: string;
    url: string;
    alt: string;
  };

  async onBeforeEnter() {
    const homepageMenu = await StrapiAdapter.getHomePageMenu();
    const homepage = await StrapiAdapter.getHomePage();
    const link = homepage?.data.attributes.Link || '';
    const url =
      `${StrapiAdapter.baseUrl}${homepage?.data.attributes.Logo.data.attributes.url}` ||
      '';
    const alt =
      homepage?.data.attributes.Logo.data.attributes.alternativeText || '';

    const homepageLogoDetails = {
      link,
      url,
      alt,
    };

    this.homepageLogoDetails = homepageLogoDetails;

    const menuGroups = homepageMenu?.data.attributes.MenuGroup;

    if (menuGroups === undefined) {
      return;
    }

    this.menuGroups = menuGroups.map((menuGroup) => {
      return {
        title: menuGroup.Display,
        items: menuGroup.menu_items.data.map((menuItem) => {
          return {
            title: menuItem.attributes.Display,
            logo: menuItem.attributes.Logo,
            link: menuItem.attributes.URL,
            authenticated: menuItem.attributes.Authenticated || false,
            imageUrl: menuItem.attributes.Image?.data?.attributes.url,
          };
        }),
      };
    });
  }

  unitSelected(event: CustomEvent) {
    if (event.detail.value as Unit) {
      Router.go(`/unit/${event.detail.value?.descriptorName}`);
    }
  }

  renderMenuItem(
    href: string,
    icon: string,
    headline: string,
    disabled = false,
    imageUrl?: string
  ) {
    let menuContent;

    if (imageUrl) {
      menuContent = html`<img
        style="width: 100%;"
        src="/defcon-2-tagline.png"
      />`;
    } else {
      menuContent = html` <vaadin-icon icon="${icon}"></vaadin-icon>
        <h2>${headline}</h2>`;
    }

    return html` <a
      class="choice-button ${disabled ? 'disabled' : ''}"
      href="${href}"
    >
      <div class="headline">${menuContent}</div>
    </a>`;
  }

  renderMenuEntries(menuGroups: MenuGroup[]) {
    const menuEntries: TemplateResult<1>[] = [];

    for (const menuGroup of menuGroups) {
      for (const menuItem of menuGroup.items) {
        menuEntries.push(
          this.renderMenuItem(
            menuItem.link,
            menuItem.logo,
            menuItem.title,
            false,
            menuItem.imageUrl
          )
        );
      }
    }

    return html` <div class="button-grid">${menuEntries}</div> `;
  }

  render(): TemplateResult {
    return html`
      <div class="background">
        <div class="container">
          <div class="splash">
            <a href="${ifDefined(this.homepageLogoDetails?.link)}">
              <img
                height="100"
                src="${ifDefined(this.homepageLogoDetails?.url)}"
                style="margin-top: 20px;"
                alt="${ifDefined(this.homepageLogoDetails?.alt)}"
              />
            </a>
            <div>
              <div class="search">
                <unit-search @unit-selected=${this.unitSelected}></unit-search>
              </div>
            </div>
            ${this.renderMenuEntries(this.menuGroups)}
            <div class="socials">
              <a class="social" href="https://discord.gg/gqBgvgGj8H">
                <img style="height: 32px" src="/discord-logo-white.svg" />
                <div>Feel free to join our Discord community.</div>
              </a>

              <a class="social" href="https://www.patreon.com/WarYes">
                <img style="height: 32px" src="/patreon-logo-white.svg" />
                <div>Support the project on Patreon.</div>
              </a>

              <a
                class="social"
                href="https://www.buymeacoffee.com/captaintoucan"
              >
                <div>
                  <img class="bmc" style="height: 32px" src="/bmc-logo.svg" />
                </div>
                <div>Buy me a coffee.</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
