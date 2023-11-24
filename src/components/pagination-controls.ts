import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/button';
import '@vaadin/icon';

const RANGE_AHEAD = 1;
const RANGE_BEHIND = 2;

@customElement('pagination-controls')
export class PaginationControls extends LitElement {
  static get styles() {
    return css`
    `;
  }

  @state()
  private _page = 1;

  public get page() {
    return this._page;
  }

  @property()
  public set page(value) {
    if (value < 1) value = 1;
    this._page = value;
  }

  @property()
  public isNextPageAvailable = false;

  numberClicked(number: number) {
    this.dispatchEvent(
      new CustomEvent('page-changed', {
        detail: {page: number},
      })
    );
  }

  nextClicked() {
    this.dispatchEvent(
      new CustomEvent('page-changed', {
        detail: {page: this.page + 1},
      })
    );
  }

  previousClicked() {
    this.dispatchEvent(
      new CustomEvent('page-changed', {
        detail: {page: this.page - 1},
      })
    );
  }

  renderNumberButton(number: number, disabled = false) {
    return html`<vaadin-button theme="tertiary" ?disabled=${number === this.page || disabled} @click=${() => {this.numberClicked(number)}}>${number}</vaadin-button>`;
  }

  render(): TemplateResult {
    const pageButtons = [];

    pageButtons.push(this.renderNumberButton(1));

    if (this.page >= 5) {
      pageButtons.push(html`<div>...</div>`);
    }

    for (
      let i = Math.max(this.page - RANGE_BEHIND, 2);
      i <= this.page + RANGE_AHEAD;
      i++
    ) {
      pageButtons.push(
        this.renderNumberButton(i, this.page + RANGE_AHEAD === i && !this.isNextPageAvailable)
      );
    }

    return html` <vaadin-button
        theme="icon"
        ?disabled=${this.page === 1}
        @click=${() => {
          this.previousClicked();
        }}
        ><vaadin-icon icon="vaadin:angle-left"></vaadin-icon
      ></vaadin-button>
      ${pageButtons}

      <vaadin-button
        theme="icon"
        ?disabled=${!this.isNextPageAvailable}
        @click=${() => {
          this.nextClicked()
        }}
        ><vaadin-icon icon="vaadin:angle-right"></vaadin-icon
      ></vaadin-button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pagination-controls': PaginationControls;
  }
}
