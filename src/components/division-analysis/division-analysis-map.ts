import {LitElement, html, css, TemplateResult, PropertyValueMap} from 'lit';

import {query, state, customElement, property} from 'lit/decorators.js';
import {SVG, Element, Rect} from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import anime from 'animejs';
import {Point} from '@svgdotjs/svg.js';

@customElement('division-analysis-map')
export class DivisionAnalysisMap extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      #resize-container {
        width: 100%;
        aspect-ratio: 1/1;
        overflow: hidden;
        border: 1px dashed var(--lumo-contrast-20pct);
        border-radius: 10px;
        background-color: var(--lumo-contrast-5pct);
        position: relative;
      }

      svg {
        opacity: 0;
      }

      .grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }

      .square {
        box-sizing: border-box;
        scale: 1.1;
      }

      .late-arrival {
        border: 2px solid white;
      }
    `;
  }

  @query('#resize-container')
  container!: HTMLDivElement;

  @query('svg')
  svg!: SVGSVGElement;

  @state()
  svgContent: string = '';

  svgInterface?: Element;
  // svgPan?: SvgPanZoom.Instance;

  @property()
  selectedDivisionDescriptor?: string;

  protected firstUpdated(): void {
    this.renderSvg();

  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.willUpdate(_changedProperties);

    if (_changedProperties.has('selectedDivisionDescriptor')) {
      this.updateSvg();
    }
  }

  private updateSvg() {
    const divisionId = this.selectedDivisionDescriptor as string | undefined;

    const allDivisions = this.svgInterface?.find('image[data-divisionId]');
    const targetDivision = this.svgInterface?.findOne(
      `image[data-divisionId=${divisionId}]`
    ) as any;

    allDivisions?.forEach((division) => {
      const originalCenterX = division.cx();
      const originalCenterY = division.cy();
      division.size(64, 64);
      division.center(originalCenterX, originalCenterY);
      if (division !== targetDivision) {
        division.opacity(0.5);
      }
      else {
        division.opacity(1);
      }
    });


    if (targetDivision) {
      const imageRect = targetDivision.bbox();
      // Increase the size of the targetDivision image element
      targetDivision.size(imageRect.width * 1.5, imageRect.height * 1.5).center(imageRect.cx, imageRect.cy);
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    this.svgInterface?.attr({
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    });
  };

  private async renderSvg() {
    await this.loadSvgContent();
    this.renderSvgElements();
    const gridSize = 20;
    this.applySvgPanZoom();
    this.addGrid(gridSize);
    this.animateSvg(gridSize);
    this.updateSvg();
  }

  private async loadSvgContent() {
    const svgContentResponse = await fetch('/division-analysis-background.svg');
    const svgContent = await svgContentResponse.text();

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    svgElement.setAttribute('width', '448');
    svgElement.setAttribute('height', '448');

    setTimeout(() => {
      svgElement.setAttribute('width', this.container.clientWidth.toString());
      svgElement.setAttribute('height', this.container.clientHeight.toString());
    }, 400);

    this.container.appendChild(svgElement);
  }

  private renderSvgElements() {
    const svg = this.shadowRoot?.querySelector('svg') as SVGSVGElement;

    // set height and width to absolute values of parent
    const svgInterface = SVG(svg); //.attr({ width: this.container.clientWidth, height: this.container.clientHeight });
    // svg.setAttribute("height", this.container.clientHeight.toString());
    // svg.setAttribute("width", this.container.clientWidth.toString());
    const zoomPoint = new Point(3500, 6600);

    svgInterface.zoom(0.25, zoomPoint);

    const images = [
      {
        divisionId: 'Descriptor_Deck_Division_UK_2nd_Infantry_multi',
        size: {width: 64, height: 64},
        position: {x: 3450, y: 6050},
        lateArrival: true,
      },
      {
        divisionId: 'Descriptor_Deck_Division_UK_1st_Armoured_multi',
        size: {width: 64, height: 64},
        position: {x: 3600, y: 5850},
      },
      {
        divisionId: 'Descriptor_Deck_Division_RFA_2_PzGrenadier_multi',
        size: {width: 64, height: 64},
        position: {x: 3650, y: 6270},
      },
      {
        divisionId: 'Descriptor_Deck_Division_US_3rd_Arm_multi',
        size: {width: 64, height: 64},
        position: {x: 3450, y: 6500},
      },
      {
        divisionId: 'Descriptor_Deck_Division_FR_5e_Blindee_multi',
        size: {width: 64, height: 64},
        position: {x: 3500, y: 6750},
      },
      {
        divisionId: 'Descriptor_Deck_Division_RFA_5_Panzer_multi',
        size: {width: 64, height: 64},
        position: {x: 3300, y: 6300},
      },
      {
        divisionId: 'Descriptor_Deck_Division_US_8th_Inf_multi',
        size: {width: 64, height: 64},
        position: {x: 3250, y: 6450},
      },
      {
        divisionId: 'Descriptor_Deck_Division_US_11ACR_multi',
        size: {width: 64, height: 64},
        position: {x: 3660, y: 6350},
      },
      {
        divisionId: 'Descriptor_Deck_Division_FR_11e_Para_multi',
        size: {width: 64, height: 64},
        position: {x: 3400, y: 6850},
        lateArrival: true,
      },

      {
        divisionId: 'Descriptor_Deck_Division_RFA_TerrKdo_Sud_multi',
        size: {width: 64, height: 64},
        position: {x: 3550, y: 6600},
      },
      {
        divisionId: 'Descriptor_Deck_Division_RDA_4_MSD_multi',
        size: {width: 64, height: 64},
        position: {x: 3950, y: 6350},
      },
      {
        divisionId: 'Descriptor_Deck_Division_RDA_7_Panzer_multi',
        size: {width: 64, height: 64},
        position: {x: 4250, y: 6250},
      },
      {
        divisionId: 'Descriptor_Deck_Division_SOV_27_Gds_Rifle_multi',
        size: {width: 64, height: 64},
        position: {x: 4050, y: 6150},
      },
      {
        divisionId: 'Descriptor_Deck_Division_SOV_35_AirAslt_Brig_multi',
        size: {width: 64, height: 64},
        position: {x: 4350, y: 6100},
      },
      {
        divisionId: 'Descriptor_Deck_Division_SOV_39_Gds_Rifle_multi',
        size: {width: 64, height: 64},
        position: {x: 3850, y: 6300},
      },
      {
        divisionId: 'Descriptor_Deck_Division_SOV_79_Gds_Tank_multi',
        size: {width: 64, height: 64},
        position: {x: 4050, y: 6300},
      },
      {
        divisionId: 'Descriptor_Deck_Division_SOV_119IndTkBrig_multi',
        size: {width: 64, height: 64},
        position: {x: 3850, y: 6200},
      },
      {
        divisionId: 'Descriptor_Deck_Division_RDA_KdA_Bezirk_Erfurt_multi',
        size: {width: 64, height: 64},
        position: {x: 3950, y: 6200},
      },
      {
        divisionId: 'Descriptor_Deck_Division_NATO_Garnison_Berlin_multi',
        size: {width: 64, height: 64},
        position: {x: 4220, y: 5900},
      },
      {
        divisionId: 'Descriptor_Deck_Division_WP_Unternehmen_Zentrum_multi',
        size: {width: 64, height: 64},
        position: {x: 4170, y: 5920},
      },
      {
        divisionId: 'Descriptor_Deck_Division_SOV_6IndMSBrig_multi',
        size: {width: 64, height: 64},
        position: {x: 4280, y: 5900},
      },

      {
        divisionId: 'Descriptor_Deck_Division_US_82nd_Airborne_multi',
        size: {width: 64, height: 64},
        position: {x: 3380, y: 6550},
        lateArrival: true,
      },
      {
        divisionId: 'Descriptor_Deck_Division_US_24th_Inf_multi',
        size: {width: 64, height: 64},
        position: {x: 3300, y: 6600},
        lateArrival: true,
      },
      {
        divisionId: 'Descriptor_Deck_Division_US_101st_Airmobile_multi',
        size: {width: 64, height: 64},
        position: {x: 3380, y: 6650},
        lateArrival: true,
      },
      {
        divisionId: 'Descriptor_Deck_Division_SOV_56_AirAslt_Brig_multi',
        size: {width: 64, height: 64},
        position: {x: 4280, y: 6050},
        lateArrival: true
      },
      {
        divisionId: 'Descriptor_Deck_Division_RDA_Rugen_Gruppierung',
        size: {width: 64, height: 64},
        position: {x: 4200, y: 5500},
      },
      {
        divisionId: 'Descriptor_Deck_Division_US_35th_Inf_multi',
        size: {width: 64, height: 64},
        position: {x: 3460, y: 6600},
        lateArrival: true
      }
    ];

    const padding = 4;
    images.forEach((image) => {
      let surroundingRect: Rect | undefined;
      if (image.lateArrival) {
        const rectX = image.position.x - image.size.width / 2 - padding;
        const rectY = image.position.y - image.size.height / 2 - padding;
        surroundingRect = svgInterface
          .rect(image.size.width + padding * 2, image.size.height + padding * 2)
          .x(rectX)
          .y(rectY)
          .attr({
            stroke: '#6493c6',
            'stroke-width': 2,
            fill: 'none',
            'stroke-dasharray': '5,5',
          });
      }

      const imageTag = svgInterface
        .image(`/divisions/${image.divisionId}.png`)
        .size(image.size.width, image.size.height)
        .x(image.position.x - image.size.width / 2)
        .y(image.position.y - image.size.height / 2)
        .data('divisionId', image.divisionId)
        .data('division', true);
      imageTag
        .on('mouseover', () => {
          imageTag.attr({cursor: 'pointer'});
          imageTag.scale(1.5);

          if (surroundingRect) {
            surroundingRect.scale(1.5);
          }
        })
        .on('mouseout', () => {
          imageTag.scale(1 / 1.5);

          if (surroundingRect) {
            surroundingRect.scale(1 / 1.5);
          }
        })
        .on('click', () => {
          this.dispatchEvent(
            new CustomEvent('division-clicked', {
              detail: {division: image.divisionId},
            })
          );
        });
    });

    this.svgInterface = svgInterface;
  }

  private addGrid(gridSize: number) {
    const grid = document.createElement('div');
    grid.classList.add('grid');

    const squareSize = Math.floor(this.container.clientWidth / gridSize);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        square.style.backgroundColor = '#24252b';
        grid.appendChild(square);
      }
    }

    this.container.appendChild(grid);
  }

  private applySvgPanZoom() {
    /*
    this.svgPan = svgPanZoom(svg, {
      panEnabled: false,
      zoomEnabled: false,
      dblClickZoomEnabled: false
    }).zoomAtPoint(6, { x: centerX + (svgWidth * -0.15), y: centerY + (svgHeight * 0.16) });
    */
  }

  private animateSvg(gridSize: number) {
    const svg = this.shadowRoot?.querySelector('svg') as SVGSVGElement;
    const tl = anime.timeline({
      complete: () => {
        const grid = this.container.querySelector('.grid');
        if (grid) {
          grid.remove();
        }
      },
    });

    tl.add({
      targets: svg,
      opacity: [0, 1],
      duration: 2000,
    });

    tl.add(
      {
        targets: this.shadowRoot?.querySelectorAll('.square'),
        scale: [
          {value: 2, easing: 'easeOutSine', duration: 0},
          {value: 0, easing: 'easeInOutQuad', duration: 1200},
        ],
        delay: anime.stagger(50, {grid: [gridSize, gridSize], from: 'center'}),
      },
      0
    );
  }

  render(): TemplateResult {
    return html` <div id="resize-container"></div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-analysis-map': DivisionAnalysisMap;
  }
}
