import {IonMenu} from '@ionic/core/components/ion-menu';
import {css, html, LitElement} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {UnitService} from '../services/unit';
//UnitService.getUnits();

@customElement('application-route')
export class Application extends LitElement {
  static get styles() {
    return css``;
  }

  @query('ion-menu')
  menu!: IonMenu;

  protected createRenderRoot() {
    return this;
  }

  private routeDidChange() {
    this.menu.close();
  }

  @state()
  loadedUnits = false;

  async firstUpdated() {
    await UnitService.getUnits();
    this.loadedUnits = true;
  }

  render() {
    return html`
      <ion-router ?useHash=${true} @ionRouteDidChange="${this.routeDidChange}">
        <ion-route component="index-route"></ion-route>
        <ion-route url="/units-list" component="units-list-route"></ion-route>
        <ion-route
          url="/unit/:unitId"
          component="unit-details-route"
        ></ion-route>
      </ion-router>

      <ion-app>
        <ion-split-pane content-id="main" when="md">
          <ion-menu side="start" menu-id="first" content-id="main">
            <ion-content>
              <ion-list>
                <ion-router-link href="/">
                  <ion-item>
                    <ion-icon
                      name="home-outline"
                      color="primary"
                      slot="start"
                    ></ion-icon>
                    <ion-label>Home</ion-label>
                    <ion-ripple-effect></ion-ripple-effect>
                  </ion-item>
                </ion-router-link>

                <ion-router-link href="/units-list">
                  <ion-item>
                    <ion-icon
                      name="list-outline"
                      color="primary"
                      slot="start"
                    ></ion-icon>
                    <ion-label>Units List</ion-label>
                    <ion-ripple-effect></ion-ripple-effect>
                  </ion-item>
                </ion-router-link>

                <ion-router-link href="/">
                  <ion-item>
                    <ion-icon
                      name="bar-chart-outline"
                      color="primary"
                      slot="start"
                    ></ion-icon>
                    <ion-label>Workspace</ion-label>
                    <ion-ripple-effect></ion-ripple-effect>
                  </ion-item>
                </ion-router-link>
              </ion-list>
            </ion-content>
          </ion-menu>
          <div class="ion-page" id="main">
            <ion-header>
              <ion-toolbar>
                <ion-buttons slot="start">
                  <ion-menu-button></ion-menu-button>
                </ion-buttons>

                <img height="43" src="/waryes-transparent.png" />
              </ion-toolbar>
            </ion-header>

            ${this.loadedUnits
              ? html`<ion-content class="ion-padding"
                  ><ion-nav></ion-nav
                ></ion-content>`
              : html`<ion-content class=""
                  ><ion-progress-bar type="indeterminate"></ion-progress-bar>
                  <div>Loading...</div></ion-content
                >`}
          </div>
        </ion-split-pane>
      </ion-app>
    `;
  }
}
