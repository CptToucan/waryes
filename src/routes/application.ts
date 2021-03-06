import {IonMenu} from '@ionic/core/components/ion-menu';
import {IonModal} from '@ionic/core/components/ion-modal';
import {css, html, LitElement} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {UnitService} from '../services/unit';
// @ts-ignore
import WaryesImage from '../../images/waryes-transparent.png';
import { SelectCustomEvent } from '@ionic/core';

@customElement('application-route')
export class Application extends LitElement {
  static get styles() {
    return css``;
  }

  @query('ion-menu')
  menu!: IonMenu;

  @query('ion-modal')
  modal?: IonModal;

  protected createRenderRoot() {
    return this;
  }

  private routeDidChange() {
    this.menu.close();
    //this.modal?.dismiss();
  }

  @state()
  loadedUnits = false;

  versionChanged(event: SelectCustomEvent<string[]>) {
    console.log(event.detail.value);
    UnitService.setUnitVersions(event.detail.value)
  }

  async firstUpdated() {
    await UnitService.getUnits();
    this.loadedUnits = true;
  }
  //  <ion-route-redirect from="/workspace-clear" to="/workspace"></ion-route-redirect>
  render() {
    return html`
      <ion-router ?useHash=${true} @ionRouteDidChange="${this.routeDidChange}">
        <ion-route component="index-route"></ion-route>
        <ion-route url="/units-list" component="units-list-route"></ion-route>
        <ion-route
          url="/unit/:unitId"
          component="unit-details-route"
        ></ion-route>

        <ion-route url="/workspace" component="workspace-route"></ion-route>
      </ion-router>

      <ion-app>
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

              <ion-router-link href="/workspace">
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
              <ion-buttons slot="end">
              <ion-item>
                  <ion-select style="max-width: 120px;" ?multiple=${true} @ionChange=${this.versionChanged} .value=${UnitService.selectedVersions}>
                    <ion-select-option value="MURAT">Murat</ion-select-option>
                    <ion-select-option value="LANNES">Lannes</ion-select-option>
                  </ion-select>
                </ion-item>


                <ion-router-link
                  href="https://discord.gg/gqBgvgGj8H"
                  target="_blank"
                >
                  <ion-button>
                    <ion-icon name="logo-discord"></ion-icon>
                  </ion-button>
                </ion-router-link>
              </ion-buttons>

              <img height="43" src=${WaryesImage} />
            </ion-toolbar>
          </ion-header>

          ${this.loadedUnits
            ? html`<ion-content class="ion-padding"
                ><ion-router-outlet></ion-router-outlet>
              </ion-content>`
            : html`<ion-content class=""
                ><ion-progress-bar type="indeterminate"></ion-progress-bar>
                <div>Loading...</div></ion-content
              >`}
        </div>
      </ion-app>
    `;
  }
}

//      <ion-split-pane content-id="main" when="md">         </ion-split-pane>

/*
<ion-button @click=${() => UnitService.toggleHistoricalUnits()}>
<ion-icon slot="icon-only" name="time-outline"></ion-icon>
</ion-button>
*/


/*

                <ion-button @click=${() => UnitService.toggleHistoricalUnits()}>
                  ${UnitService.useHistoricalUnits ? 'ALL UNITS' : 'LANNES'}
                </ion-button>

*/