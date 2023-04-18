import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Deck} from '../classes/deck';
import {InfoPanelType, Unit, Weapon} from '../types/unit';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/tabs';
import {TabsSelectedChangedEvent} from '@vaadin/tabs';

type ReportUnit = {
  unit: Unit;
  quantity: number;
  isTransport: boolean;
};

type TransportReportUnit = {
  isArmed: boolean;
} & ReportUnit;

type ATReportUnit = {
  highestPenWeapon: Weapon;
} & ReportUnit;

type OverviewReport = {
  sellablePoints: number;
  aaSupplyCost: number;
  mortarSupplyCost: number;
  howitzerSupplyCost: number;
  mlrsSupplyCost: number;
  totalSupply: number;
};

@customElement('intel-report')
export class IntelReport extends LitElement {
  static get styles() {
    return css`
      .main {
        display: flex;
        flex-direction: row;
        height: 900px;
      }

      vaadin-grid {
        height: 100%;
        --lumo-base-color: transparent;
      }

      .content {
        display: flex;
        flex: 1 1 auto;
        height: 100%;
        box-sizing: border-box;
      }

      .overview-report {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-m);
      }

      h3 {
        margin: 0;
      }

      .panel {
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-m);
        border-radius: var(--lumo-border-radius);
        width: 100%;
        box-sizing: border-box;
      }

      .costs {
        display: flex;
        justify-content: space-evenly;
        flex-wrap: wrap;
      }

      .labelled-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-left: var(--lumo-space-m);
        padding-right: var(--lumo-space-m);
        flex: 1 0 0;
      }

      .labelled-stat > .stat {
        font-weight: bold;
        font-size: var(--lumo-font-size-xl);
      }

      .labelled-stat > .label {
        color: var(--lumo-contrast-60pct);
        text-align: center;
      }
    `;
  }

  @property()
  deck?: Deck;

  @property()
  selectedTabIndex = 0;

  getIntelUnits(deck: Deck) {
    const reportUnits: ReportUnit[] = [];

    for (const deckUnit of deck.units) {
      const unit = deck.getUnitForPack(deckUnit.pack);
      const veterancyQuantities = deck.getVeterancyQuantitiesForPack(
        deckUnit.pack
      );
      if (unit) {
        reportUnits.push({
          unit,
          quantity: veterancyQuantities[deckUnit.veterancy],
          isTransport: false,
        });
      }

      if (deckUnit.transport) {
        reportUnits.push({
          unit: deckUnit.transport,
          quantity: veterancyQuantities[deckUnit.veterancy],
          isTransport: true,
        });
      }
    }

    // filter units for only unique ones while summing the quantity
    const uniqueUnits: ReportUnit[] = [];
    for (const reportUnit of reportUnits) {
      const existingUnit = uniqueUnits.find(
        (uniqueUnit) =>
          uniqueUnit.unit.id === reportUnit.unit.id &&
          uniqueUnit.isTransport === reportUnit.isTransport
      );
      if (existingUnit) {
        existingUnit.quantity += reportUnit.quantity;
      } else {
        uniqueUnits.push(reportUnit);
      }
    }

    return uniqueUnits;
  }

  generateOverviewReport(units: ReportUnit[]): OverviewReport {
    let sellablePoints = 0;
    let aaSupplyCost = 0;
    let mortarSupplyCost = 0;
    let howitzerSupplyCost = 0;
    let mlrsSupplyCost = 0;
    let totalSupply = 0;

    const unitTypesToCountSupplyFor = ['AA', 'mortar', 'howitzer', 'mlrs'];

    for (const unit of units) {
      if (unit.unit.isSellable) {
        sellablePoints += unit.unit.commandPoints * unit.quantity;
      }

      const unitSpeciality = unit.unit.specialities[0];
      if (unitTypesToCountSupplyFor.includes(unitSpeciality)) {
        for (const weapon of unit.unit.weapons) {
          if (unitSpeciality === 'AA') {
            aaSupplyCost += (weapon.supplyCost || 0) * unit.quantity;
          }

          if (unitSpeciality === 'mortar') {
            mortarSupplyCost += (weapon.supplyCost || 0) * unit.quantity;
          }

          if (unitSpeciality === 'howitzer') {
            howitzerSupplyCost += (weapon.supplyCost || 0) * unit.quantity;
          }

          if (unitSpeciality === 'mlrs') {
            mlrsSupplyCost += (weapon.supplyCost || 0) * unit.quantity;
          }
        }
      }

      if (unit.unit.supply) {
        totalSupply += unit.unit.supply * unit.quantity;
      }
    }

    return {
      sellablePoints,
      aaSupplyCost,
      mortarSupplyCost,
      howitzerSupplyCost,
      mlrsSupplyCost,
      totalSupply,
    };
  }

  renderOverviewReport(units: ReportUnit[]) {
    const overviewReport = this.generateOverviewReport(units);
    return html`
      <div class="overview-report">
        <div class="panel">
          <h3>Supply Costs</h3>
          <div class="costs">
            <div class="labelled-stat">
              <div class="stat">${overviewReport.aaSupplyCost}</div>
              <div class="label">AA</div>
            </div>

            <div class="labelled-stat">
              <div class="stat">${overviewReport.mortarSupplyCost}</div>
              <div class="label">Mortar</div>
            </div>

            <div class="labelled-stat">
              <div class="stat">${overviewReport.howitzerSupplyCost}</div>
              <div class="label">Howitzer</div>
            </div>

            <div class="labelled-stat">
              <div class="stat">${overviewReport.mlrsSupplyCost}</div>
              <div class="label">MLRS</div>
            </div>
          </div>
        </div>
        <div class="panel">
          <h3>Misc</h3>
          <div class="costs">
            <div class="labelled-stat">
              <div class="stat">${overviewReport.totalSupply}</div>
              <div class="label">Total Supply</div>
            </div>
            <div class="labelled-stat">
              <div class="stat">${overviewReport.sellablePoints}</div>
              <div class="label">Sellable Points</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  generateReconReport(units: ReportUnit[]) {
    // create a new array of top 10 units sorted by optics
    const reconUnits = units
      .sort((a, b) => {
        const opticsA = a.unit.optics || 0;
        const opticsB = b.unit.optics || 0;
        return opticsB - opticsA;
      })
      .slice(0, 10);

    return reconUnits;
  }

  renderReconReport(units: ReportUnit[]) {
    const reconReport = this.generateReconReport(units);
    return html`
      <div class="panel">
        <vaadin-grid .items="${reconReport}">
          <vaadin-grid-column path="unit.name"></vaadin-grid-column>
          <vaadin-grid-column path="unit.commandPoints"></vaadin-grid-column>
          <vaadin-grid-column path="unit.optics"></vaadin-grid-column>
          <vaadin-grid-column path="unit.speed"></vaadin-grid-column>
          <vaadin-grid-column path="quantity"></vaadin-grid-column>
        </vaadin-grid>
      </div>
    `;
  }

  generateAirReport(units: ReportUnit[]) {
    const reportUnits: ReportUnit[] = [];
    for (const unit of units) {
      if (
        unit.unit.infoPanelType === InfoPanelType.PLANE ||
        unit.unit.infoPanelType === InfoPanelType.HELICOPTER ||
        unit.unit.infoPanelType === InfoPanelType.TRANSPORT_HELICOPTER ||
        unit.unit.infoPanelType === InfoPanelType.SUPPLY_HELICOPTER
      ) {
        reportUnits.push(unit);
      }
    }

    // sort units speed
    reportUnits.sort((a, b) => {
      const speedA = a.unit.speed || 0;
      const speedB = b.unit.speed || 0;
      return speedB - speedA;
    });

    return reportUnits;
  }

  renderAirReport(units: ReportUnit[]) {
    const airReport = this.generateAirReport(units);
    return html`
      <div class="panel">
        <vaadin-grid .items="${airReport}">
          <vaadin-grid-column path="unit.name"></vaadin-grid-column>
          <vaadin-grid-column path="unit.commandPoints"></vaadin-grid-column>
          <vaadin-grid-column path="unit.travelTime"></vaadin-grid-column>
          <vaadin-grid-column path="quantity"></vaadin-grid-column>
          <vaadin-grid-column path="unit.speed"></vaadin-grid-column>
          <vaadin-grid-column path="quantity"></vaadin-grid-column>
        </vaadin-grid>
      </div>
    `;
  }

  generateTransportReport(units: ReportUnit[]): TransportReportUnit[] {
    const reportUnits: TransportReportUnit[] = [];
    for (const unit of units) {
      if (
        unit.unit.infoPanelType === InfoPanelType.TRANSPORT_VEHICLE ||
        unit.unit.infoPanelType === InfoPanelType.TRANSPORT_HELICOPTER
      ) {
        reportUnits.push({
          ...unit,
          isArmed: unit.unit.weapons.length > 0 ? true : false,
        });
      }
    }

    // sort units speed
    reportUnits.sort((a, b) => {
      const speedA = a.unit.speed || 0;
      const speedB = b.unit.speed || 0;
      return speedB - speedA;
    });

    return reportUnits;
  }

  renderTransportReport(units: ReportUnit[]) {
    const transportReport = this.generateTransportReport(units);

    return html` <div class="panel">
      <vaadin-grid .items="${transportReport}">
        <vaadin-grid-column path="unit.name"></vaadin-grid-column>
        <vaadin-grid-column path="unit.commandPoints"></vaadin-grid-column>
        <vaadin-grid-column path="unit.speed"></vaadin-grid-column>
        <vaadin-grid-column path="unit.roadSpeed"></vaadin-grid-column>
        <vaadin-grid-column path="unit.fuelMove"></vaadin-grid-column>
        <vaadin-grid-column path="isArmed"></vaadin-grid-column>
        <vaadin-grid-column path="quantity"></vaadin-grid-column>
      </vaadin-grid>
    </div>`;
  }

  generateATReport(units: ReportUnit[]): ATReportUnit[] {
    const reportUnits: ATReportUnit[] = [];
    for (const unit of units) {
      // Find the unit with the highest penetration and add some stats to the reportunit as a for loop
      if (unit.unit.weapons.length > 0) {
        let highestPenetrationWeapon = unit.unit.weapons[0];
        for (const weapon of unit.unit.weapons) {
          if (
            (weapon.penetration || 0) >
            (highestPenetrationWeapon.penetration || 0)
          ) {
            highestPenetrationWeapon = weapon;
          }
        }

        if ((highestPenetrationWeapon.penetration || 0) > 5) {
          reportUnits.push({
            ...unit,
            highestPenWeapon: highestPenetrationWeapon,
          });
        }
      }
    }

    // sort units penetration

    reportUnits.sort((a, b) => {
      const speedA = a.highestPenWeapon.penetration || 0;
      const speedB = b.highestPenWeapon.penetration || 0;
      return speedB - speedA;
    });

    return reportUnits;
  }

  renderATReport(units: ReportUnit[]) {
    const atReport = this.generateATReport(units);

    return html` <div class="panel">
      <vaadin-grid .items="${atReport}">
        <vaadin-grid-column path="unit.name"></vaadin-grid-column>
        <vaadin-grid-column path="unit.commandPoints"></vaadin-grid-column>
        <vaadin-grid-column
          path="highestPenWeapon.weaponName"
        ></vaadin-grid-column>
        <vaadin-grid-column
          path="highestPenWeapon.penetration"
        ></vaadin-grid-column>
        <vaadin-grid-column
          path="highestPenWeapon.groundRange"
        ></vaadin-grid-column>
        <vaadin-grid-column path="quantity"></vaadin-grid-column>
      </vaadin-grid>
    </div>`;
  }

  selectedTabChanged(e: TabsSelectedChangedEvent) {
    const tabIndex = e.detail.value;
    this.selectedTabIndex = tabIndex;
  }

  render() {
    const tabs = ['Overview', 'Recon', 'Air', 'Transport', 'AT'];

    if (this.deck) {
      const units = this.getIntelUnits(this.deck);
      let tabContent = html``;
      switch (this.selectedTabIndex) {
        case 0:
          tabContent = this.renderOverviewReport(units);
          break;
        case 1:
          tabContent = this.renderReconReport(units);
          break;
        case 2:
          tabContent = this.renderAirReport(units);
          break;
        case 3:
          tabContent = this.renderTransportReport(units);
          break;
        case 4:
          tabContent = this.renderATReport(units);
          break;
      }

      return html` <div class="main">
        <vaadin-tabs
          orientation="vertical"
          @selected-changed="${this.selectedTabChanged}"
        >
          ${tabs.map((tab) => html`<vaadin-tab>${tab}</vaadin-tab>`)}
        </vaadin-tabs>
        <div class="content">${tabContent}</div>
      </div>`;
    } else {
      return html` No deck to analyse `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'intel-report': IntelReport;
  }
}
