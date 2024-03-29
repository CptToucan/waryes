import {css, html, LitElement, TemplateResult} from 'lit';
import {BeforeEnterObserver} from '@vaadin/router';
import {customElement, state} from 'lit/decorators.js';
import '../components/division-analysis/division-analysis';
import {collection, getDocs, limit, query} from 'firebase/firestore';
import {FirebaseService} from '../services/firebase';
import {DivisionAnalysis} from '../components/division-analysis/division-analysis';
import {BucketFolder, BundleManagerService} from '../services/bundle-manager';
import {Division} from '../types/deck-builder';
import '../components/filter/division-filter';

@customElement('division-analysis-route')
export class DivisionAnalysisRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
        gap: var(--lumo-space-m);
        position: relative;
      }

      .header {
        display: flex;
        flex-direction: row;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        flex-wrap: wrap;
        gap: var(--lumo-space-m);
      }

      .card {
        display: flex;
        background-color: var(--lumo-contrast-5pct);
        font-size: var(--lumo-font-size-s);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-s);
        flex-direction: column;
      }

      a {
        text-decoration: underline;
        color: var(--lumo-primary-text-color);
      }

      .filter-container {
        display: flex;
        position: sticky;
        top: 0px;
        background-color: var(--lumo-base-color);
        padding: var(--lumo-space-s);
        z-index: 1;
      }
      division-filter {
        width: 100%;
      }
    `;
  }

  @state()
  divisionAnalysis: DivisionAnalysis[] | null = null;

  @state()
  divisions: Division[] | null = null;

  @state()
  selectedDivisions: Division[] = [];

  async onBeforeEnter(): Promise<void> {
    // fetch divisionAnalysis from firebase

    const q = query(
      collection(FirebaseService.db, 'division_analysis'),
      limit(1)
    );

    const divisions =
      (await BundleManagerService.getDivisionsForBucket(BucketFolder.WARNO)) ||
      [];

    const querySnapshot = await getDocs(q);
    const divisionAnalysisRecord = querySnapshot.docs[0].data();

    const divisionAnalysis = JSON.parse(divisionAnalysisRecord.data);

    this.divisionAnalysis = divisionAnalysis as DivisionAnalysis[];
    this.divisions = divisions;
  }

  render(): TemplateResult {
    return html`
      <div class="header">
        <div class="card">
          This division analysis feature is designed to help you understand the
          strengths and weaknesses of each division. The numbers were calculated
          by taking the feedback of many of the top players in the community.
          The numbers are not perfect, but they are a good starting point for
          understanding the divisions. Thank you for your contributions:
          <ul>
            <li>Tiberius-Rancor</li>
            <li>Sotek</li>
            <li>Dar_rick_s</li>
            <li>P.Uri.Tanner</li>
            <li>Nalyd</li>
            <li><a href="https://www.twitch.tv/awoodenbox96">awoodenbox</a></li>
            <li>
              <a href="https://www.youtube.com/@tmanplays69">tmanplays</a>
            </li>
            <li>Darkneutron</li>
            <li>
              <a href="https://www.youtube.com/@onoez2k/videos">Integer</a>
            </li>
            <li><a href="https://www.twitch.tv/xlathans">Lathans</a></li>
          </ul>
        </div>
      </div>
      <div class="filter-container">
        ${(this.divisions?.length || 0) > 0
          ? html`<division-filter
              @division-filter-changed=${(e: CustomEvent) =>
                (this.selectedDivisions = e.detail?.divisions)}
              .divisions=${this.divisions}
            ></division-filter>`
          : html``}
      </div>
      <div class="grid">
        ${this.divisions?.map((division) => {
          const divisionAnalysis = this.divisionAnalysis?.find(
            (divisionAnalysis) =>
              divisionAnalysis.descriptor === division.descriptor
          );

          const isSelected = this.selectedDivisions.find(
            (selectedDivision) => selectedDivision.descriptor ===
            division.descriptor);
          if(
            isSelected || this.selectedDivisions.length === 0
          ) {
            return html`
            <div class="card">
              <division-analysis-display
                .divisionName=${division.name}
                .divisionAnalysis=${divisionAnalysis}
              ></division-analysis-display>
            </div>
          `;
          }

          return html``;

        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-analysis-route': DivisionAnalysisRoute;
  }
}
