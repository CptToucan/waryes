import {TemplateResult, html} from 'lit';
import {getIconForSpecialty} from './get-icon-for-specialty';
import {getTraitFromIconName} from './get-trait-from-icon-name';
import '@vaadin/icon';

export function getIconForTrait(trait: string): TemplateResult {
  const elementId = `trait-${trait}`;

  const icon = getIconForSpecialty(trait);
  const fullTrait = getTraitFromIconName(icon);

  return html` 
  <div class="trait-tooltip-toggle">
    <vaadin-icon
      id="${elementId}"
      icon="waryes:${icon}"
      class="trait-tooltip-toggle"
    ></vaadin-icon>
    <div class="trait-tooltip">
      <div class="trait-tooltip-header">
        <div class="trait-tooltip-name"><b>Trait: </b>${fullTrait.name}</div>
        <div class="trait-tooltip-range"><b>Range: </b>${fullTrait.range}</div>
      </div>
      <div class="trait-tooltip-activation"><b>Activation: </b>${fullTrait.activationCondition}</div>
      <div class="trait-tooltip-effects">
        <b>Effects: </b>
        <ul>
          ${fullTrait.effects.map(e => html`<li>${e}</li>`)}
        </ul>
      </div>
    </div>
  </div>`;
}
