import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import '@vaadin/icon';
import {Pack} from '../../types/deck-builder';
import {Unit, UnitMap} from '../../types/unit';
import '@vaadin/dialog';
import {ArmouryCardOptions} from './armoury-card';
import './transport-selection';
import { TransportSelection } from './transport-selection';

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

  @query("transport-selection")
  transportDialog!: TransportSelection 

  @state()
  showTransportSelection = false;

  unitVeterancyOptions: UnitVeterancyOptions | null = null;

  openTransportDialog(unit: Unit, veterancy: number) {
    this.transportDialog.showTransportDialog();
    this.unitVeterancyOptions = {
      unit,
      veterancy
    }
  }

  closeTransportDialog() {
    this.transportDialog.closeTransportDialog();
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

  transportSelected(transport: Unit) {
    this.dispatchEvent(new CustomEvent("pack-selected", {detail: {
      transport,
      unit: this.unitVeterancyOptions?.unit,
      veterancy: this.unitVeterancyOptions?.veterancy,
      pack: this.pack
    }}))
    this.closeTransportDialog();
  }

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
        <transport-selection @transport-selected=${(event: CustomEvent) => this.transportSelected(event.detail.transport)} .availableTransports=${this.availableTransportsArmouryCardOptions}></transport-selection>
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

/*
${this.showTransportSelection
  ? this.renderTransportSelection()
  : html``}
  */