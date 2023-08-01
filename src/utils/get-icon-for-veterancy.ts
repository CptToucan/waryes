import {TemplateResult, html} from 'lit';
import '@vaadin/icon';

const veterancies: string[] = ['recruit', 'trained', 'veteran', 'elite'];

export function getIconForVeterancy(veterancy: number): TemplateResult {
  const elementId = `veterancy-${veterancy}`;
  return html` <vaadin-icon
      id="${elementId}"
      style='transform: rotate(180deg)'
      icon="waryes:${veterancies[veterancy]}"
    ></vaadin-icon
    ><vaadin-tooltip for=${elementId} text=${veterancies[veterancy]} position="top"></vaadin-tooltip>`;
}

export function getVeterancyName(veterancy: number): string {
  return veterancies[veterancy];
}