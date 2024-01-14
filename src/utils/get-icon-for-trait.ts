import {TemplateResult, html} from 'lit';
import { getIconForSpecialty } from './get-icon-for-specialty';
import '@vaadin/icon';


function humanize(input: string): string {
  const words = input.split('-');
  // remove the first word if it is 'trait'
  if (words[0] === 'trait') {
    words.shift();
  }


  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function getIconForTrait(trait: string): TemplateResult {
  const elementId = `trait-${trait}`;

  const speciality = getIconForSpecialty(trait);

  const icon = speciality;
  let tooltip: string;
  try {
    tooltip = humanize(speciality);
  }
  catch(err) {
    tooltip = speciality;
  }


  if (speciality === 'parachute') {
    tooltip = "Airbourne"
  }

  return html` <vaadin-icon
      id="${elementId}"
      icon="waryes:${icon}"
    ></vaadin-icon
    ><vaadin-tooltip for=${elementId} text=${tooltip} position="top"></vaadin-tooltip>`;
}