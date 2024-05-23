import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {User} from 'firebase/auth';
import {PickBanAdapter} from '../../classes/PickBanAdapter';
import {ComboBox, ComboBoxSelectedItemChangedEvent} from '@vaadin/combo-box';
import {Router} from '@vaadin/router';
import {PickBanConfigWithId, TEAM_ASSIGNMENT} from '../../types/PickBanTypes';
import { notificationService } from '../../services/notification';

const NUMBER_OF_TEAMS = 2;

@customElement('pick-ban-create-session')
export class PickBanCreateSession extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
      }

      .fields {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-m);
        padding-bottom: var(--lumo-space-m);
      }
    `;
  }

  @property()
  loggedInUser: User | null | undefined;

  @property()
  configs: PickBanConfigWithId[] = [];

  @state()
  selectedTeam?: number | null;

  @state()
  selectedConfig?: PickBanConfigWithId;

  @state()
  assignmentMode?: TEAM_ASSIGNMENT | null;

  @query('#team-selector')
  teamSelector?: ComboBox;

  @query('#assignment-mode-selector')
  assignmentModeSelector?: ComboBox;

  renderConfigSelector() {
    return html`<vaadin-combo-box
      .items=${this.configs}
      item-id-path="id"
      item-label-path="name"
      item-value-path="id"
      label="Ruleset"
      @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<any>) => {
        this.selectedConfig = e.detail.value;
        this.assignmentMode = null;
        this.selectedTeam = null;
        this.teamSelector?.clear();
      }}
    ></vaadin-combo-box>`;
  }

  renderTeamSelector() {
    const numberOfTeams = NUMBER_OF_TEAMS;

    const teamsOptions = [];

    for (let i = 0; i < numberOfTeams; i++) {
      teamsOptions.push(i + 1);
    }

    return html`<vaadin-combo-box
      id="team-selector"
      .items=${[...teamsOptions]}
      label="Team"
      @selected-item-changed=${(
        e: ComboBoxSelectedItemChangedEvent<number>
      ) => {
        this.selectedTeam = e.detail.value;
      }}
    ></vaadin-combo-box>`;
  }

  renderAssignmentModeSelector(disabled = false) {
    return html`<vaadin-combo-box
      id="assignment-mode-selector"
      .items=${Object.values(TEAM_ASSIGNMENT)}
      label="Assignment Mode"
      ?disabled=${disabled}
      @selected-item-changed=${(
        e: ComboBoxSelectedItemChangedEvent<TEAM_ASSIGNMENT>
      ) => {
        this.assignmentMode = e.detail.value || undefined;
      }}
    ></vaadin-combo-box>`;
  }

  render(): TemplateResult {
    let shouldRenderTeamSelector =
      this.assignmentMode === TEAM_ASSIGNMENT.MANUAL;

    const shouldDisableAssignmentModeSelector = !this.selectedConfig;

    let shouldDisableButton = !this.selectedConfig || !this.assignmentMode;

    if (this.assignmentMode === TEAM_ASSIGNMENT.MANUAL) {
      shouldDisableButton = shouldDisableButton || !this.selectedTeam;
    }

    return html`
      <div class="fields">
        ${this.renderConfigSelector()}
        ${this.renderAssignmentModeSelector(
          shouldDisableAssignmentModeSelector
        )}
        ${shouldRenderTeamSelector ? this.renderTeamSelector() : html``}
      </div>
      <vaadin-button
        ?disabled=${shouldDisableButton}
        theme="primary"
        @click=${async () => {
          try {
            if (!this.selectedConfig) {
              return;
            }

            let session;

            if (this.assignmentMode === TEAM_ASSIGNMENT.RANDOM) {
              session = await PickBanAdapter.createSession(
                this.selectedConfig.id
              );
            } else if (this.assignmentMode === TEAM_ASSIGNMENT.MANUAL) {
              if (!this.selectedTeam) {
                return;
              }

              const selectedTeamIndex = this.selectedTeam - 1;
              session = await PickBanAdapter.createSession(
                this.selectedConfig.id,
                selectedTeamIndex
              );
            } else {
              throw new Error('Invalid assignment mode');
            }

            Router.go(`/pick-ban-tool/${session?.session.id}`);
          } catch (error) {
            console.error(error);
            notificationService.instance?.addNotification({
              duration: 3000,
              content: (error as Error)?.message ? (error as Error).message : 'Error creating session',
              theme: 'error',
            });
          }
        }}
      >
        Start Session
      </vaadin-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pick-ban-create-session': PickBanCreateSession;
  }
}
