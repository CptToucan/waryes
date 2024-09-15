import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/upload';
import '@vaadin/text-field';
import {getAuth} from 'firebase/auth';
import {UploadRequestEvent} from '@vaadin/upload';
import {FirebaseService} from '../services/firebase';
import {BundleManagerService} from '../services/bundle-manager';

@customElement('play-the-game-route')
export class PlayTheGame extends LitElement {
  static get styles() {
    return css``;
  }

  async getHeaders() {
    return {
      Authorization: `Bearer ${await getAuth().currentUser?.getIdToken()}`,
    };
  }

  idToken?: string;

  @state()
  patchName?: string;

  async onBeforeEnter() {
    FirebaseService.auth?.onAuthStateChanged(async (user) => {
      const idToken = await user?.getIdToken();

      if (idToken) {
        this.idToken = idToken;
      }
    });
  }

  uploadOverride(_e: UploadRequestEvent) {
      _e.preventDefault();

      const file = _e.detail.file;
      // get josn
      const reader = new FileReader();


      reader.onload = async (e) => {
        const text = e.target?.result;

         // save to indexeddb

        await BundleManagerService.setOverride(file.name, text);
        console.log(text);
        _e.detail.xhr.abort();
      };

      reader.readAsText(file);
      
      console.log('upload-request');
      console.log(_e.detail);
    
  }

  render(): TemplateResult {

    return html`
      <vaadin-button
        @click=${async () => {
          const result1 = await BundleManagerService.loadOverride('patch.json');
          const result2 = await BundleManagerService.loadOverride('warno.json');
          const result3 = await BundleManagerService.loadOverride('damageTable.json');
          console.log(result1, result2, result3);
        }}
      >
        Log
      </vaadin-button>

      <vaadin-button
        @click=${() => {
          BundleManagerService.clearOverrides();
        }}
      >
        Clear
      </vaadin-button>

      <vaadin-upload
        accept=".json"
        min-files=${3}
        max-files=${3}
        @upload-request=${this.uploadOverride}
      ></vaadin-upload>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'play-the-game-route': PlayTheGame;
  }
}
