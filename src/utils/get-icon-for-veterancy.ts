import {TemplateResult, html} from 'lit';

const veterancies: string[] = ['recruit', 'trained', 'veteran', 'elite'];

export function getIconForVeterancy(veterancy: number): TemplateResult {
  return html` <vaadin-icon
    style=${veterancy !== 3 ? 'transform: rotate(180deg)' : ''}
    icon="waryes-svg:${veterancies[veterancy]}"
  ></vaadin-icon>`;
}
