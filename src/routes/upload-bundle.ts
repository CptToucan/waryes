import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import "@vaadin/upload";
import "@vaadin/text-field";
import { getAuth } from 'firebase/auth';
import { UploadRequestEvent } from '@vaadin/upload';
import { FirebaseService } from '../services/firebase';
import { TextFieldValueChangedEvent } from '@vaadin/text-field';

@customElement('upload-bundle-route')
export class UploadBundleRoute extends LitElement {
  static get styles() {
    return css`
     
    `;
  }

  async getHeaders() {
    return {
      'Authorization': `Bearer ${await getAuth().currentUser?.getIdToken()}`,
    }
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


  render(): TemplateResult {

    let maxFiles = 0;

    if(this.patchName) {
      maxFiles = 1;
    }

    return html`
      <vaadin-text-field label="Patch Name" @value-changed=${(e: TextFieldValueChangedEvent) => {
        this.patchName = e.detail.value;
      }}></vaadin-text-field>
      <vaadin-upload
        accept=".zip"
        max-files=${maxFiles}
        @upload-request=${async (e: UploadRequestEvent) => {

        // set url
        e.detail.xhr.open('POST', `${process.env.API_URL}/data-upload/upload-bundle`);

        // add patch name
        e.detail.xhr.setRequestHeader('X-Patch-Name', this.patchName || "");

        if (this.idToken) {
          e.detail.xhr.setRequestHeader('Authorization', `Bearer ${this.idToken}`);
        }
      }}
      ></vaadin-upload>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'upload-bundle-route': UploadBundleRoute;
  }
}
