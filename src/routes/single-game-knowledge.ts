import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/markdown-renderer';
import {BeforeEnterObserver, RouterLocation} from '@vaadin/router';
import {StrapiAdapter} from '../classes/StrapiAdapter';
import {GameKnowledge} from '../types/GameKnowledgeTypes';

@customElement('single-knowledge-route')
export class SingleGameKnowledgeRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        padding: var(--lumo-space-s);
        padding-top: var(--lumo-space-xl);
        gap: var(--lumo-space-m);
        position: relative;
      }

      @media (max-width: 800px) {
        :host {
          flex-direction: column;
        }
      }

      .content {
        flex: 1 1 70%;
      }

      .links {
        flex: 1 1 30%;
      }

      h1,
      h2 {
        margin: 0;
        margin-bottom: var(--lumo-space-s);
      }

      .card-button {
        display: inline-block;
        padding: 10px 20px;
        background-color: var(--lumo-contrast-10pct);
        border-radius: 5px;
        text-decoration: none;
        color: var(--lumo-text-color);
        font-weight: bold;
        transition: background-color 0.3s ease;
      }

      .card-button:hover {
        background-color: var(--lumo-contrast-20pct);
      }

      .card {
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-s);
        padding: var(--lumo-space-s);
        background-color: var(--lumo-contrast-5pct);
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: var(--lumo-space-s);
        flex-direction: column;
      }

      .fab {
        position: absolute;
        top: 0;
        left: 0;
      }
    `;
  }

  @state()
  private gameKnowledge?: GameKnowledge;

  async onBeforeEnter(location: RouterLocation) {
    const slug = location?.params?.slug as string;

    if (!slug) {
      return;
    }

    const gameKnowledgeResponse = await StrapiAdapter.getSingleGameKnowledge(
      slug
    );

    this.gameKnowledge = gameKnowledgeResponse?.data;
    //this.gameKnowledges = gameKnowledges?.data || [];
  }

  renderRelatedGameKnowledge() {
    return html`<div class="card links">
      <h2>Related Game Knowledge</h2>
      <div class="button-group">
        ${this.gameKnowledge?.attributes?.related_game_knowledges?.data?.map(
          (relatedGameKnowledge) => html` <a
            class="card-button"
            href="/game-knowledge/${relatedGameKnowledge.attributes.slug}"
            >${relatedGameKnowledge.attributes.Title}</a
          >`
        )}
      </div>
    </div>`;
  }

  render(): TemplateResult {
    const relatedGameKnowledges =
      this.gameKnowledge?.attributes?.related_game_knowledges?.data || [];

    const shouldRenderRelatedGameKnowledge = relatedGameKnowledges.length > 0;

    return html`
      <div class="fab">
        <vaadin-button theme="tertiary" @click=${() => {
          history.back();
        }}>
          <vaadin-icon icon="vaadin:arrow-left" slot="prefix"></vaadin-icon>
          Back
        </vaadin-button>
      </div>
      <div class="card content">
        <h1>${this.gameKnowledge?.attributes?.Title}</h1>
        <markdown-renderer
          .markdown=${this.gameKnowledge?.attributes?.Content}
        ></markdown-renderer>
      </div>
      ${shouldRenderRelatedGameKnowledge
        ? this.renderRelatedGameKnowledge()
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'single-knowledge-route': SingleGameKnowledgeRoute;
  }
}
