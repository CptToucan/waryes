import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {BeforeEnterObserver} from '@vaadin/router';

import {LoadUnitsAndDivisionsMixin} from '../mixins/load-units-and-divisions';

@customElement('pick-ban-sessions-route')
export class PickBanSessionsRoute
  extends LoadUnitsAndDivisionsMixin(LitElement)
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        padding: var(--lumo-space-s);

        align-items: center;
        flex-direction: column;
        flex: 1 1 100%;
        height: 100%;
        box-sizing: border-box;
      }
    `;
  }

  onBeforeEnter() {}

  render(): TemplateResult {
    return html`No session`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-sessions-route': PickBanSessionsRoute;
  }
}
