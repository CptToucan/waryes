import {BeforeEnterObserver} from '@vaadin/router';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {BucketFolder, BundleManagerService} from '../services/bundle-manager';
import {Division} from '../types/deck-builder';
import {Unit} from '../types/unit';

@customElement('weapons-table-route')
export class WeaponsTableRoute extends LitElement implements BeforeEnterObserver {
  static get styles() {
    return css`

    
      .compact-grid::part(cell) {
        font-size: var(--lumo-font-size-s);
      }

    `;
  }

  @state()
  units: Unit[] = [];

  @state()
  filteredUnits?: Unit[];

  @state()
  divisions: Division[] = [];

  async onBeforeEnter() {
    let units = await BundleManagerService.getUnits();
    const divisions =
      (await BundleManagerService.getDivisionsForBucket(BucketFolder.WARNO)) ||
      [];

    // sort by motherCountry

    this.units = units;
    this.filteredUnits = units;
    this.divisions = divisions;
  }

  render(): TemplateResult {
    return html`
      <vaadin-grid class="compact-grid" theme="compact column-borders" style="--vaadin-grid-cell-background: red;" .items="${this.units}" column-reordering-allowed>
        <vaadin-grid-column path="name" resizable></vaadin-grid-column>
        <vaadin-grid-column path="commandPoints" resizable></vaadin-grid-column>
        <vaadin-grid-column path="optics" resizable></vaadin-grid-column>
        <vaadin-grid-column path="optics" resizable></vaadin-grid-column>
        <vaadin-grid-column path="optics" resizable></vaadin-grid-column>
        <vaadin-grid-column path="optics" resizable></vaadin-grid-column>
        <vaadin-grid-column path="optics" resizable></vaadin-grid-column>
        <vaadin-grid-column path="optics" resizable></vaadin-grid-column>
        <vaadin-grid-column path="optics" resizable></vaadin-grid-column>
        <vaadin-grid-column path="maxDamage" resizable></vaadin-grid-column>
      </vaadin-grid>
    `;
  }
}
