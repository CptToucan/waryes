import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import '@vaadin/icon';
import {Pack} from '../../types/deck-builder';
import {Unit, UnitMap} from '../../types/unit';
import '@vaadin/dialog';
import {dialogFooterRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';
import type {DialogOpenedChangedEvent} from '@vaadin/dialog';
import {ArmouryCardOptions} from './armoury-card';

interface UnitVeterancyOptions {
  unit: Unit,
  veterancy: number
}


@customElement('pack-armoury-card')
export class PackArmouryCard extends LitElement {
  static get styles() {
    return css``;
  }

  @property()
  pack?: Pack;

  @property()
  unitMap?: UnitMap;

  @property()
  disabled = false;

  @state()
  showTransportSelection = false;

  unitVeterancyOptions: UnitVeterancyOptions | null = null;

  openTransportDialog(unit: Unit, veterancy: number) {
    this.showTransportSelection = true;
    this.unitVeterancyOptions = {
      unit,
      veterancy
    }
  }

  closeTransportDialog() {
    this.showTransportSelection = false;
    this.unitVeterancyOptions = null
  }

  get availableTransportsArmouryCardOptions(): ArmouryCardOptions[] {
    if (this.pack && this.pack.availableTransportList?.length > 0) {
      const transportsOptions: ArmouryCardOptions[] =
        this.pack.availableTransportList.map((transportDescriptor) => {
          return {unit: this.unitMap?.[transportDescriptor]};
        }) as ArmouryCardOptions[];

      return transportsOptions;
    }

    return [];
  }

  unitAddButtonClicked(unit: Unit, veterancy: number) {
    if (this.pack) {
      if (this.availableTransportsArmouryCardOptions.length > 0) {
        this.openTransportDialog(unit, veterancy);
      } else {
        this.dispatchEvent(new CustomEvent("pack-selected", {detail: {
          unit, veterancy, transport: undefined, pack: this.pack
        }}))
      }
    }
  }

  transportUnitAddButtonClicked(transport: Unit) {
    this.dispatchEvent(new CustomEvent("pack-selected", {detail: {
      transport,
      unit: this.unitVeterancyOptions?.unit,
      veterancy: this.unitVeterancyOptions?.veterancy,
      pack: this.pack
    }}))
    this.closeTransportDialog();
  }

  renderTransportSelection() {
    if (
      this.availableTransportsArmouryCardOptions &&
      this.availableTransportsArmouryCardOptions.length > 0
    ) {
      return html` <vaadin-dialog
        header-title="Select Transport"
        @opened-changed="${(e: DialogOpenedChangedEvent) =>
          ( e.detail.value === false ? this.closeTransportDialog() : null )}"
        ${dialogRenderer(
          () =>
            html`${this.availableTransportsArmouryCardOptions?.map(
              (options) =>
                html`<armoury-card
                  style="margin-bottom: var(--lumo-space-s);"
                  .options=${options}
                  @add-button-clicked=${(event: CustomEvent) => this.transportUnitAddButtonClicked(event.detail.transport)}
                ></armoury-card>`
            )}`,
          []
        )}
        ${dialogFooterRenderer(
          () =>
            html`<vaadin-button @click="${this.closeTransportDialog}"
              >Cancel</vaadin-button>
              
              ${this.pack?.availableWithoutTransport ? html`<vaadin-button @click="${undefined}"
              >No Transport</vaadin-button>` : html``}
              `,
          []
        )}
        .opened="${true}"
      ></vaadin-dialog>`;
    }

    return html``;
  }

  renderDialog() {}

  render(): TemplateResult {
    if (this.unitMap && this.pack?.unitDescriptor && this.pack !== undefined) {
      const unit = this.unitMap[this.pack.unitDescriptor];

      const armouryCardOptions: ArmouryCardOptions = {
        unit,
        veterancyOptions: {
          unitQuantityMultipliers: this.pack.numberOfUnitInPackXPMultiplier,
          defaultUnitQuantity: this.pack.numberOfUnitsInPack,
        },
      };
      return html`
        ${this.showTransportSelection
          ? this.renderTransportSelection()
          : html``}

        <armoury-card
          .options=${armouryCardOptions}
          .disabled=${this.disabled}
          @add-button-clicked=${
            (event: CustomEvent) =>
              this.unitAddButtonClicked(event.detail.unit, event.detail.veterancy)
          }
        ></armoury-card>
      `;
    } else {
      return html`ERROR`;
    }
  }
}
