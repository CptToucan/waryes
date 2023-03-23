import {customElement, property, state} from 'lit/decorators.js';
import {LitElement, html, TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import '@vaadin/dialog';
import {dialogFooterRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';
import type {FormLayoutResponsiveStep} from '@vaadin/form-layout';
import '@vaadin/form-layout';
import '@vaadin/password-field';
import '@vaadin/text-field';
import '@vaadin/select';
import {SelectItem, SelectValueChangedEvent} from '@vaadin/select';
import {Deck} from '../../classes/deck';

// Rush
// Turtle
// Harassment
// Micro
// Macro
// All-in
// Defensive
// CQC
// Light
// Heavy
// Artillery
// Air
// Meme
// Spam
// Ranked
// Team
// Para


@customElement('upload-deck')
export class UploadDeck extends LitElement {
  @state()
  private showing = true;

  @property()
  deck?: Deck;

  public showDialog() {
    this.showing = true;
  }
  public closeDialog() {
    this.showing = false;
  }

  private comboBoxItems: SelectItem[] = [
    {value: 'Rush', label: 'Rush'},
    {value: 'Turtle', label: 'Turtle'},
    {value: 'Harassment', label: 'Harassment'},
    {value: 'Micro', label: 'Micro'},
    {value: 'Macro', label: 'Macro'},
    {value: 'All-in', label: 'All-in'},
    {value: 'Defensive', label: 'Defensive'},
    {value: 'CQC', label: 'CQC'},
    {value: 'Light', label: 'Light'},
    {value: 'Heavy', label: 'Heavy'},
    {value: 'Artillery', label: 'Artillery'},
    {value: 'Air', label: 'Air'},
    {value: 'Meme', label: 'Meme'},
    {value: 'Spam', label: 'Spam'},
    {value: 'Ranked', label: 'Ranked'},
    {value: 'Team', label: 'Team'},

  ];

  @state()
  private selectedType = '';

  private responsiveSteps: FormLayoutResponsiveStep[] = [
    // Use one column by default
    {minWidth: 0, columns: 1},
  ];

  render(): TemplateResult {
    const deckCode = this.deck?.toDeckCode();

    return html`
      <vaadin-dialog
        header-title="Select Transport"
        @opened-changed=${(event: CustomEvent) => {
          if (event.detail.value === false) {
            this.closeDialog();
          }
        }}
        ${dialogRenderer(
          () =>
            html`
              <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}">
                <vaadin-text-field
                  colspan="2"
                  label="Code"
                  ?readOnly=${true}
                  value=${ifDefined(deckCode)}
                ></vaadin-text-field>
                <vaadin-select
                  label="Type"
                  .items=${this.comboBoxItems}
                  .value=${this.selectedType}
                  @value-changed=${(event: SelectValueChangedEvent) =>
                    (this.selectedType = event.detail.value)}
                ></vaadin-select>
                <div>
                  ${`Toucan's ${this.selectedType} ${this.deck?.division.name} Deck`}
                </div>
              </vaadin-form-layout>
            `,
        )}
        ${dialogFooterRenderer(() => html`<vaadin-button @click="${() => {}}"
              >Cancel</vaadin-button
            >
            <vaadin-button @click="${this.closeDialog}"
              >Cancel</vaadin-button
            >`, [])}
        .opened="${this.showing}"
      ></vaadin-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'upload-deck': UploadDeck;
  }
}
