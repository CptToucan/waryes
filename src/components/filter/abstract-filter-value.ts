import {css, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {FilterMetadata} from '../../types/FilterMetadata';

export abstract class AbstractFilterValue extends LitElement {
  @property()
  filter?: FilterMetadata<unknown>;

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
      }

      * {
        flex: 1 1 0;
      }
    `;
  }
}