import {customElement, property, state} from 'lit/decorators.js';
import {LitElement, html, TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import '@vaadin/dialog';
import {dialogFooterRenderer, dialogRenderer} from '@vaadin/dialog/lit.js';
import type {FormLayoutResponsiveStep} from '@vaadin/form-layout';
import '@vaadin/form-layout';
import '@vaadin/password-field';
import '@vaadin/text-field';
import '@vaadin/multi-select-combo-box';
import {Deck} from '../../classes/deck';
import {getAuth} from 'firebase/auth';
import type {MultiSelectComboBoxSelectedItemsChangedEvent} from '@vaadin/multi-select-combo-box';
import { tags } from '../../types/tags';
import { saveDeckToFirebase } from '../../utils/save-deck-to-firebase';
import { Router } from '@vaadin/router';

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



  @state()
  private selectedTags: string[] = [];

  private responsiveSteps: FormLayoutResponsiveStep[] = [
    // Use one column by default
    {minWidth: 0, columns: 1},
  ];

  private async _uploadDeck(deckName: string) {
    const deck = this.deck;
    const selectedTags = this.selectedTags;

    if(deck) {
      try {
        const deckRef = await saveDeckToFirebase(
          deck,
          deckName,
          selectedTags
        );
        Router.go(`/deck/${deckRef?.id}`);
      }
      catch(err) {
        console.error(err);
      }
    }

    this.closeDialog();
  }

  render(): TemplateResult {
    const deckCode = this.deck?.toDeckCode();
    const auth = getAuth();
    const user = auth.currentUser;

    const deckName = `${user?.displayName}'s ${this.deck?.division.name}`;


    return html`
      <vaadin-dialog
        header-title="Upload Deck"
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
                  .required=${true}
                  ?readOnly=${true}
                  value=${ifDefined(deckCode)}
                ></vaadin-text-field>

                <vaadin-multi-select-combo-box
                  label="Tags"
                  .required=${true}
                  .items=${tags}
                  .selectedItems=${this.selectedTags}
                  .errorMessage=${'Please select at least one tag'}
                  @selected-items-changed=${(
                    event: MultiSelectComboBoxSelectedItemsChangedEvent<string>
                  ) => {
                    this.selectedTags = event.detail.value;
                  }}
                >
                </vaadin-multi-select-combo-box>
                <div>${deckName}</div>
              </vaadin-form-layout>
            `,
          [this.deck]
        )}
        ${dialogFooterRenderer(
          () => html` <vaadin-button @click="${this.closeDialog}"
              >Cancel</vaadin-button
            ><vaadin-button
              theme="primary"
              @click="${() => this._uploadDeck(deckName)}"
              >Upload</vaadin-button
            >`,
          [deckName]
        )}
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
