import {MultiSelectComboBoxSelectedItemsChangedEvent} from '@vaadin/multi-select-combo-box';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/warno-map';
import {Map} from '../components/warno-map';

const MAPS: Map[] = [
  {
    name: 'Black Forest',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/blackforest_conquest_4.png',
  },
  {
    name: 'Chemical',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/chemical_conquest_4.png',
  },
  {
    name: 'Chemical',
    mode: 'Conquest',
    size: '4v4',
    image: 'images/maps/chemical_conquest_8.png',
  },
  {
    name: 'Chemical',
    mode: 'Destruction',
    size: '4v4',
    image: 'images/maps/chemical_destruction_8.png',
  },
  {
    name: 'Crown',
    mode: 'Conquest',
    size: '10v10',
    image: 'images/maps/crown_conquest_20.png',
  },
  {
    name: 'Crown',
    mode: 'Destruction',
    size: '10v10',
    image: 'images/maps/crown_destruction_20.png',
  },
  {
    name: 'Cyrus',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/cyrus_conquest_6.png',
  },
  {
    name: 'Cyrus',
    mode: 'Destruction',
    size: '3v3',
    image: 'images/maps/cyrus_destruction_6.png',
  },
  {
    name: 'Dangerhills',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/dangerhills_conquest_6.png',
  },
  {
    name: 'Dangerhills',
    mode: 'Destruction',
    size: '3v3',
    image: 'images/maps/dangerhills_destruction_6.png',
  },
  {
    name: 'Darkstream',
    mode: 'Conquest',
    size: '4v4',
    image: 'images/maps/darkstream_conquest_8.png',
  },
  {
    name: 'Darkstream',
    mode: 'Conquest',
    size: '10v10',
    image: 'images/maps/darkstream_conquest_20.png',
  },
  {
    name: 'Deathrow',
    mode: 'Conquest',
    size: '1v1',
    image: 'images/maps/deathrow_conquest_2.png',
  },
  {
    name: 'Deathrow',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/deathrow_conquest_4.png',
  },
  {
    name: 'Deathrow',
    mode: 'Destruction',
    size: '2v2',
    image: 'images/maps/deathrow_destruction_4.png',
  },
  {
    name: 'Geisa',
    mode: 'Conquest',
    size: '1v1',
    image: 'images/maps/geisa_conquest_2.png',
  },
  {
    name: 'Geisa',
    mode: 'Conquest',
    size: '10v10',
    image: 'images/maps/geisa_conquest_20.png',
  },
  {
    name: 'Geisa',
    mode: 'Destruction',
    size: '10v10',
    image: 'images/maps/geisa_destruction_20.png',
  },
  {
    name: 'Ironwaters',
    mode: 'Conquest',
    size: '10v10',
    image: 'images/maps/ironwaters_conquest_20.png',
  },
  {
    name: 'Ironwaters',
    mode: 'Destruction',
    size: '10v10',
    image: 'images/maps/ironwaters_destruction_20.png',
  },
  {
    name: 'Loop',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/loop_conquest_4.png',
  },
  {
    name: 'Loop',
    mode: 'Conquest',
    size: '10v10',
    image: 'images/maps/loop_conquest_20.png',
  },
  {
    name: 'Loop',
    mode: 'Destruction',
    size: '10v10',
    image: 'images/maps/loop_destruction_20.png',
  },
  {
    name: 'Mount River',
    mode: 'Conquest',
    size: '1v1',
    image: 'images/maps/mountriver_conquest_2.png',
  },
  {
    name: 'Mount River',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/mountriver_conquest_4.png',
  },
  {
    name: 'Mount River',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/mountriver_conquest_6.png',
  },
  {
    name: 'Mount River',
    mode: 'Destruction',
    size: '3v3',
    image: 'images/maps/mountriver_destruction_6.png',
  },
  {
    name: 'Rift',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/rift_conquest_6.png',
  },
  {
    name: 'Rift',
    mode: 'Destruction',
    size: '3v3',
    image: 'images/maps/rift_destruction_6.png',
  },
  {
    name: 'Ripple',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/ripple_conquest_4.png',
  },
  {
    name: 'Ripple',
    mode: 'Destruction',
    size: '2v2',
    image: 'images/maps/ripple_destruction_4.png',
  },
  {
    name: 'Rocks',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/rocks_conquest_6.png',
  },
  {
    name: 'Rocks',
    mode: 'Destruction',
    size: '3v3',
    image: 'images/maps/rocks_destruction_6.png',
  },
  {
    name: 'Triplestrike',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/triplestrike_conquest_6.png',
  },
  {
    name: 'Triplestrike',
    mode: 'Destruction',
    size: '3v3',
    image: 'images/maps/triplestrike_destruction_6.png',
  },
  {
    name: 'Twin Cities',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/twincities_conquest_6.png',
  },
  {
    name: 'Twin Cities',
    mode: 'Destruction',
    size: '3v3',
    image: 'images/maps/twincities_destruction_6.png',
  },
  {
    name: 'Two Lakes',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/twolakes_conquest_4.png',
  },
  {
    name: 'Two Lakes',
    mode: 'Destruction',
    size: '2v2',
    image: 'images/maps/twolakes_destruction_4.png',
  },
  {
    name: 'Two Ways',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/twoways_conquest_4.png',
  },
  {
    name: 'Two Ways',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/twoways_conquest_6.png',
  },
  {
    name: 'Two Ways',
    mode: 'Destruction',
    size: '2v2',
    image: 'images/maps/twoways_destruction_4.png',
  },
  {
    name: 'Vertigo',
    mode: 'Conquest',
    size: '2v2',
    image: 'images/maps/vertigo_conquest_4.png',
  },
  {
    name: 'Vertigo',
    mode: 'Destruction',
    size: '2v2',
    image: 'images/maps/vertigo_destruction_4.png',
  },
  {
    name: 'Volcano',
    mode: 'Conquest',
    size: '3v3',
    image: 'images/maps/volcano_conquest_6.png',
  },
  {
    name: 'Volcano',
    mode: 'Destruction',
    size: '3v3',
    image: 'images/maps/volcano_destruction_6.png',
  },
];

const MODES = MAPS.map((map) => map.mode).filter(
  (value, index, self) => self.indexOf(value) === index
);

const SIZES = MAPS.map((map) => map.size)
  .filter((value, index, self) => self.indexOf(value) === index)
  .sort();

@customElement('maps-route')
export class MapsRoute extends LitElement {
  static get styles() {
    return css`
      .maps {
        display: flex;
        flex-wrap: wrap;
        padding: var(--lumo-space-m);
        gap: var(--lumo-space-m);
        justify-content: center;
        max-width: 100vw;
      }

      .filters {
        display: flex;
        flex-wrap: wrap;
        padding: var(--lumo-space-m);
        gap: var(--lumo-space-m);
      }
    `;
  }

  @state()
  private filteredMaps: Map[] = MAPS;

  @state()
  filters: {mode: string[]; size: string[]} = {
    mode: [],
    size: [],
  };

  filter() {
    if (this.filters.mode.length === 0 && this.filters.size.length === 0) {
      this.filteredMaps = MAPS;
      return;
    }

    this.filteredMaps = MAPS.filter((map) => {
      if (
        this.filters.mode.length > 0 &&
        !this.filters.mode.includes(map.mode)
      ) {
        return false;
      }

      if (
        this.filters.size.length > 0 &&
        !this.filters.size.includes(map.size)
      ) {
        return false;
      }

      return true;
    });
  }

  render(): TemplateResult {
    return html` <div class="filters">
        <vaadin-multi-select-combo-box
          label="Mode"
          .items=${MODES}
          @selected-items-changed=${(
            e: MultiSelectComboBoxSelectedItemsChangedEvent<string>
          ) => {
            this.filters = {
              ...this.filters,
              mode: e.detail.value,
            };

            this.filter();
          }}
        ></vaadin-multi-select-combo-box>
        <vaadin-multi-select-combo-box
          label="Size"
          .items=${SIZES}
          @selected-items-changed=${(
            e: MultiSelectComboBoxSelectedItemsChangedEvent<string>
          ) => {
            this.filters = {
              ...this.filters,
              size: e.detail.value,
            };

            this.filter();
          }}
        ></vaadin-multi-select-combo-box>
      </div>
      <div class="maps">
        ${this.filteredMaps.map(
          (map) => html`<warno-map .map=${map}></warno-map>`
        )}
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'map-route': MapsRoute;
  }
}
