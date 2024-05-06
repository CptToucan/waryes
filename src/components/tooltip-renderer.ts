import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import { StrapiAdapter } from '../classes/StrapiAdapter';

@customElement('tooltip-renderer')
export class TooltipRenderer extends LitElement {
  @property({type: String}) tooltipId?: string;
  @state() private tooltipContent: string = '';

  static styles = css`
    /* Add your custom styles here */
    :host {
      display: inline;
    }

    .tooltip-target {
      text-decoration: underline;
      text-transform: uppercase;
      color: var(--lumo-primary-color-50pct);
      cursor: help;
    }
  `;

  render(): TemplateResult {
    return html`<span class="tooltip-target" id="target">${this.tooltipId}</span
      ><vaadin-tooltip
        text="${this.tooltipContent}"
        for="target"
        position="top"
      ></vaadin-tooltip>`;
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('tooltipId')) {
      this.loadTooltipContent();
    }
  }

  async loadTooltipContent() {
    // Make your API request here to load the content for the new tooltip
    try {
      const response = await StrapiAdapter.getTooltip(this.tooltipId!);

      if(!response) {
        console.error('Failed to load tooltip content:', response);
        this.tooltipContent = 'Failed to load tooltip content';
      }


      const tooltipContent = response?.data.attributes.Description;
      this.tooltipContent = tooltipContent || 'No description available';
    } catch (error) {
      console.error('Failed to load tooltip content:', error);
      this.tooltipContent = 'Failed to load tooltip content';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tooltip-renderer': TooltipRenderer;
  }
}
