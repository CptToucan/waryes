import {TemplateResult, html} from 'lit';
import {getIconForSpecialty} from './get-icon-for-specialty';
import '@vaadin/icon';
import {getTraitFromIconName} from './get-trait-from-icon-name';
import "@vaadin/tooltip/src/vaadin-tooltip";

export function getIconForTrait(trait: string): TemplateResult {
  const elementId = `trait-${trait}`;
  const speciality = getIconForSpecialty(trait);
  const icon = speciality;

  const tooltip = getTraitFromIconName(speciality)?.name; // will be null if not a trait

  return html` <vaadin-icon
      id="${elementId}"
      icon="waryes:${icon}"
    ></vaadin-icon
    ><vaadin-tooltip for=${elementId} text=${tooltip} position="top"></vaadin-tooltip>`;
}