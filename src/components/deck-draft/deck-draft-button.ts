import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Division} from '../../types/deck-builder';

@customElement('deck-draft-button')
export class DeckDraftButton extends LitElement {
  static get styles() {
    return css`
      :host{
        border: none;
        padding: 0;
        background: none;
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-m);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 3px solid var(--lumo-primary-color-50pct);
      }

      :host(:focus) {
        outline: 3px solid var(--lumo-primary-color-50pct);
      }

      :host([disabled]) {
        background-color: var(--lumo-base-color);
        opacity: 0.5 !important;
        cursor: none;
        pointer-events: none;
      }



    `;
  }

  @property({
    reflect: true,
  })
  role = 'button';

  @property({
    reflect: true,
    type: Boolean,
  })
  disabled = false;

  @property({
    reflect: true,
  })
  tabindex = '0';

  @state()
  divisions: Division[] = [];

  render(): TemplateResult {
    return html`
      <slot>
        ${this.disabled ? html`Loading...` : ''}
      </slot>
    `;
  }

  
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-draft-button': DeckDraftButton;
  }
}
