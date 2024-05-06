import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/markdown-renderer';
import {BeforeEnterObserver} from '@vaadin/router';
import {StrapiAdapter} from '../classes/StrapiAdapter';
import {GameKnowledgeGroup} from '../types/GameKnowledgeTypes';

@customElement('game-knowledge-route')
export class GameKnowledgesRoute
  extends LitElement
  implements BeforeEnterObserver
{
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
        gap: var(--lumo-space-s);
        position: relative;
        margin-left: auto;
        margin-right: auto;
        max-width: 1000px;
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        margin-top: var(--lumo-space-s);
      }

      h1, p {
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

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: var(--lumo-space-s);
      }
    `;
  }

  @state()
  private gameKnowledgeGroups: GameKnowledgeGroup[] = [];

  async onBeforeEnter() {
    const gameKnowledgePage = await StrapiAdapter.getGameKnowledgePage();

    const gameKnowledgeGroups =
      gameKnowledgePage?.data?.attributes?.GameKnowledgeGroup || [];
    this.gameKnowledgeGroups = gameKnowledgeGroups;
  }

  render(): TemplateResult {
    return html`
    <h1>
      Game Knowledge
    </h1>
    <p>
      Find our collated game knowledge here.
    </p>
      ${this.gameKnowledgeGroups.map(
        (gameKnowledgeGroup) => html`
          <div>
            <h2>${gameKnowledgeGroup.Title}</h2>
            <div class="button-group">
              ${gameKnowledgeGroup.game_knowledges.data.map(
                (gameKnowledge) => html`
                  <a
                    class="card-button"
                    href="/game-knowledge/${gameKnowledge.attributes.slug}"
                    >${gameKnowledge.attributes.Title}</a
                  >
                `
              )}
            </div>
          </div>
        `
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-knowledge-route': GameKnowledgesRoute;
  }
}

/*
          <a class="card-button" href="/game-knowledge/${gameKnowledge.attributes.slug}"
            >${gameKnowledge.attributes.Title}</a
          >
          */
