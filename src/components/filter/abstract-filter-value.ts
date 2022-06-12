import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {FilterMetadata} from '../../metadata/FilterMetadata';

export abstract class AbstractFilterValue extends LitElement {
  @property()
  filter?: FilterMetadata<unknown>;
}
