import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {getTraitFromIconName} from '../utils/get-trait-from-icon-name';
import "@vaadin/icon/src/vaadin-icon";
import {getIconForSpecialty} from '../utils/get-icon-for-specialty';

/**
 * Component for rendering the traits of a unit
 */
@customElement('unit-traits')
export class UnitTraits extends LitElement {
  static get styles() {
    return css`
      .trait-tooltip-toggle {
        position: relative;

          .trait-tooltip {
            visibility: hidden;
            display: none;
            position: absolute;
            top: 30px;
            background-color: var(--lumo-base-color);
            border-radius: var(--lumo-border-radius);
            color: var(--lumo-body-text-color);
            padding: 10px;
            text-transform: none;
            width: 220px;
            font-size: 11px;
            z-index: 1;
          }

          .trait-tooltip div {
            padding-top: 2px;
            padding-bottom: 2px;
          }

          .trait-tooltip ul {
            padding: 2px 0px 0px 25px;
            margin: 0px;
          }

          .trait-tooltip div:first-child {
            padding-top: 0px;
          }

          .trait-tooltip div:last-child {
            padding-bottom: 0px;
          }

          .trait-tooltip-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            white-space: nowrap;
          }

          &:hover .trait-tooltip {
            display: flex;
            visibility: visible;
            flex-direction: column;
          }
        }

        .icon-container {
          padding: var(--lumo-space-xs);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--lumo-space-xs);
        }

        .icons {
          display: flex;
          padding-top: var(--lumo-space-xs);
          padding-bottom: var(--lumo-space-xs);
        }
    `;
  }

  @property({ type: Array })
  traitNames: Array<string> = [];


  private _shiftTooltipOnViewportOverflow(event: MouseEvent) {
    const tooltipToggler = event.currentTarget as HTMLElement;
    const openedTooltip = tooltipToggler.querySelector<HTMLElement>('.trait-tooltip');

    const rightBoundary = openedTooltip?.getBoundingClientRect().right ?? 0;
    const tooltipWidth = 200; // width less padding
    const shift = rightBoundary - window.innerWidth - 8; // less the padding on view route element

    if (openedTooltip && shift > 0)
      openedTooltip.style.right = `${(-tooltipWidth + shift)}px`;
  }

  private _resetShiftOnTooltipClose(event: MouseEvent) {
    const tooltipToggler = event.currentTarget as HTMLElement;
    const openedTooltip = tooltipToggler.querySelector<HTMLElement>('.trait-tooltip');
    openedTooltip?.style.removeProperty('right');
  }

  render(): TemplateResult {
    console.log(this.traitNames);
    const traits = this.traitNames.map(n => getTraitFromIconName(getIconForSpecialty(n)));
    return html`<div class="icon-container">
      ${traits.map(t => (
        html`<div class="trait-tooltip-toggle" @mouseover="${this._shiftTooltipOnViewportOverflow}" @mouseout="${this._resetShiftOnTooltipClose}">
          <vaadin-icon
            id="${t?.name}"
            icon="waryes:${t?.icon}"
            class="trait-tooltip-toggle"
            ></vaadin-icon>
            <div class="trait-tooltip">
              <div class="trait-tooltip-header">
                <div class="trait-tooltip-name"><b>Trait: </b>${t?.name}</div>
                <div class="trait-tooltip-range"><b>Range: </b>${t?.range}</div>
              </div>
                <div class="trait-tooltip-activation"><b>Activation: </b>${t?.activationCondition}</div>
                <div class="trait-tooltip-effects">
                  <b>Effects: </b>
                    <ul>
                      ${t?.effects?.map(e => html`<li>${e}</li>`)}
                    </ul>
                </div>
            </div>
        </div>`
      ))}
    </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unit-traits': UnitTraits;
  }
}
