import { css, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { Unit } from "../../types/unit";
import { PanelItem, UnitInfoPanelView } from "../unit-info-panel-view";

@customElement("deck-draft-info-panel")
export default class DeckDraftInfoPanel extends UnitInfoPanelView {
  static get styles() {
    return css`
      :host {
        color: var(--lumo-contrast-90pct);
        font-size: var(--lumo-font-size-xxs);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .info-row {
        display: flex;
        flex-direction: column;
        margin-bottom: var(--lumo-space-s);

      }


      .stat {
        display: flex;
        flex: 1 1 0px;
        padding: var(--lumo-space-xs) 0;
        font-size: var(--lumo-font-size-m);
        justify-content: space-between;
      }

      .stat-name {
        color: var(--lumo-contrast-60pct);
        font-size: var(--lumo-font-size-m);
      }



    `;
  }

  render(): TemplateResult {
    if(!this.unit) return html``;

    const panelLayout = this.getLayoutForPanelType(this.unit?.infoPanelType, this.unit);
    return html`
      ${this.renderPanelDisplay(panelLayout)}
    `;
  }

  renderPanelDisplay(panelType: PanelItem[][]): TemplateResult<1> {
    return html`
      ${panelType.map(
        (row) => html`<div class="info-row">
          ${row.map(
            (item) =>
              html`<div class="stat">
                <div class="stat-name">${item.display}</div>
                <div class="stat-value">${item.value}</div>
              </div>`
          )}
        </div>`
      )}
    `;
  }

  defaultPanel(unit: Unit): PanelItem[][] {
    const oldLayout = super.defaultPanel(unit);
    // create new layout structure for deck draft, and extract these display names and values
    const layoutTokensToExtract: string[][] = [["Max Dmg", "Optics", "Stealth", "Speed"], ["Adv. Deploy", "Smoke"] ];
    const newLayout: PanelItem[][] = this.mapLayout(layoutTokensToExtract, oldLayout);

    return newLayout;
  }

  infantryPanel(unit: Unit): PanelItem[][] {
    const oldLayout = super.infantryPanel(unit);
    // create new layout structure for deck draft, and extract these display names and values
    const layoutTokensToExtract: string[][] = [["Strength", "Optics", "Stealth", "Speed"], ["Adv. Deploy"]];
    const newLayout: PanelItem[][] = this.mapLayout(layoutTokensToExtract, oldLayout);

    return newLayout;
  }

  helicopterPanel(unit: Unit): PanelItem[][] {
    const layoutTokensToExtract: string[][] = [["Max Dmg", "Optics", "Stealth", "Speed"], ["Adv. Deploy", "ECM"] ];
    const oldLayout = super.helicopterPanel(unit);
    const newLayout: PanelItem[][] = this.mapLayout(layoutTokensToExtract, oldLayout);
    return newLayout;
  }

  transportHelicopterPanel(unit: Unit): PanelItem[][] {
    return this.helicopterPanel(unit);
  }

  transportVehiclePanel(unit: Unit): PanelItem[][] {
    return this.defaultPanel(unit);
  }

  supplyHelicopterPanel(unit: Unit): PanelItem[][] {
    const layoutTokensToExtract: string[][] = [["Supply"], ["Max Dmg", "Optics", "Stealth", "Speed"], ["Adv. Deploy", "ECM"] ];
    const oldLayout = super.supplyHelicopterPanel(unit);
    const newLayout: PanelItem[][] = this.mapLayout(layoutTokensToExtract, oldLayout);
    return newLayout;
  }

  supplyVehiclePanel(unit: Unit): PanelItem[][] {
    const layoutTokensToExtract: string[][] = [["Supply"], ["Max Dmg", "Optics", "Stealth", "Speed"], ["Adv. Deploy"] ];
    const oldLayout = super.supplyVehiclePanel(unit);
    const newLayout: PanelItem[][] = this.mapLayout(layoutTokensToExtract, oldLayout);
    return newLayout;
  }

  planePanel(unit: Unit): PanelItem[][] {
    const layoutTokensToExtract: string[][] = [["Max Dmg", "Speed", "Travel Time", "Turn Radius"], ["Bomb Strategy", "ECM"] ];
    const oldLayout = super.planePanel(unit);
    const newLayout: PanelItem[][] = this.mapLayout(layoutTokensToExtract, oldLayout);
    return newLayout;
  }





  private mapLayout(layoutTokensToExtract: string[][], oldLayout: PanelItem[][]) {
    const newLayout: PanelItem[][] = [];

    for (const row of layoutTokensToExtract) {
      const newRow: PanelItem[] = [];
      for (const token of row) {

        // recursively search for the token in the old layout
        const search = (layout: PanelItem[][]): PanelItem | undefined => {
          for (const row of layout) {
            for (const item of row) {
              if (item.display === token)
                return item;
            }
          }

          return undefined;
        };
        const item = search(oldLayout);
        if (item)
          newRow.push(item);

      }
      newLayout.push(newRow);
    }
    return newLayout;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-draft-info-panel': DeckDraftInfoPanel;
  }
}