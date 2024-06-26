import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {BeforeEnterObserver} from '@vaadin/router';

import {LoadUnitsAndDivisionsMixin} from '../mixins/load-units-and-divisions';

@customElement('finished-pick-ban-session-route')
export class FinishedPickBanSessionRoute
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
    'finished-pick-ban-session-route': FinishedPickBanSessionRoute;
  }
}
