import {CheckboxCheckedChangedEvent} from '@vaadin/checkbox';
import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {BucketFolder, BundleManagerService} from '../services/bundle-manager';
import {notificationService} from '../services/notification';

@customElement('mod-selector')
export class ModSelector extends LitElement {
  static get styles() {
    return css`
      mod-image {
        height: 20px;
      }
      .databases {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: var(--lumo-space-l);
        padding: var(--lumo-space-l);
      }

      .database-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 150px;
        flex: 1 1 100%;
      }
    `;
  }

  protected async firstUpdated(): Promise<void> {
    await BundleManagerService.loadConfig();
    this.initialised = true;
  }

  @property()
  initialised = false;

  render(): TemplateResult {
    if (this.initialised) {
      return html`
        <div class="databases">
          <div class="database-option">
            <div>
              <mod-image .mod=${BucketFolder.FRAGO}></mod-image>
            </div>
            <vaadin-checkbox
              value="frago"
              label=""
              ?checked=${BundleManagerService.config?.[BucketFolder.FRAGO]}
              @change=${(event: CheckboxCheckedChangedEvent) => {
                const checked = (event.target as HTMLInputElement).checked;
                BundleManagerService.setConfig(BucketFolder.FRAGO, checked);
                notificationService.instance?.addNotification({
                  content: `Frago mod ${
                    checked ? 'enabled' : 'disabled'
                  } refreshing in 3 seconds`,
                  duration: 3000,
                  theme: '',
                });
              }}
            ></vaadin-checkbox>
          </div>
          <div class="database-option">
            <div>
              <mod-image .mod=${BucketFolder.WARNO_LET_LOOSE}></mod-image>
            </div>
            <vaadin-checkbox
              value="wll"
              label=""
              ?checked=${BundleManagerService.config?.[
                BucketFolder.WARNO_LET_LOOSE
              ]}
              @change=${(event: CheckboxCheckedChangedEvent) => {
                const checked = (event.target as HTMLInputElement).checked;
                BundleManagerService.setConfig(
                  BucketFolder.WARNO_LET_LOOSE,
                  checked
                );

                notificationService.instance?.addNotification({
                  content: `Warno Let Loose mod ${
                    checked ? 'enabled' : 'disabled'
                  } refreshing in 3 seconds`,
                  duration: 3000,
                  theme: '',
                });
              }}
            ></vaadin-checkbox>
          </div>
        </div>
      `;
    }

    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mod-selector': ModSelector;
  }
}
