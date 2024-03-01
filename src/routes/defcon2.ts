import {css, html, LitElement, TemplateResult /*, unsafeCSS*/} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('defcon2-route')
export class IndexRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex: 1 1 100%;
        position: relative;
        height: calc(100vh - 44px);
      }

      .defcon-image {
        margin-top: var(--lumo-space-m);
        margin-bottom: var(--lumo-space-s);
        max-width: 100%;
        max-height: 100px;
      }

      .card {
        display: flex;
        background-color: var(--lumo-base-color);
        font-size: var(--lumo-font-size-s);
        border-radius: var(--lumo-border-radius);
        padding: var(--lumo-space-m);
        flex-direction: column;
        align-items: center;
        max-width: 800px;
        position: absolute;
        margin-top: var(--lumo-space-m);
        overflow-y: auto;
        max-height: calc(100% - 64px);
        max-width: 800px;
      }

      .links {
        font-size: var(--lumo-font-size-l);
      }

      h2,
      h3 {
        margin: 0;
        margin-bottom: var(--lumo-space-s);
      }

      section {
        width: 100%;
        height: 100%;
        perspective: 50vmax;
        overflow: hidden;
        background-image: linear-gradient(
          to top,
          #ff0000,
          #d90011,
          #b20022,
          #8a0032,
          #640043,
          #3e004e,
          #180059,
          #000066,
          #0000aa,
          #0000cc,
          #0000e6,
          #0000ff
        );
      }

      @keyframes crawlingWall {
        to {
          background-position-y: bottom;
        }
      }

      div.crawl {
        background-size: 40px 40px;
        background-image: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.2) 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.2) 1px,
            transparent 1px
          );
        height: inherit;
        transform: rotateX(50deg);
        transform-origin: top center;
        animation: 15s linear infinite crawlingWall;
        background-position-y: top;
      }

      .link-button {
        cursor: var(--lumo-clickable-cursor);
        text-decoration: none;
        display: flex;
        justify-content: center;
        align-items: center;
        --lumo-button-size: var(--lumo-size-m);
        min-width: calc(var(--lumo-button-size) * 2);
        height: var(--lumo-button-size);
        padding: 0
          calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius-m) / 2);
        margin: var(--lumo-space-xs) 0;
        box-sizing: border-box;
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size-m);
        font-weight: 500;
        color: var(--_lumo-button-color, var(--lumo-primary-text-color));
        background-color: var(
          --_lumo-button-background-color,
          var(--lumo-contrast-5pct)
        );
        border-radius: var(--lumo-border-radius-m);
        cursor: var(--lumo-clickable-cursor);
      }

      .button-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--lumo-space-s);
        width: 100%;
        flex: 1 1 0px;
      }

      .primary {
        background-color: var(--lumo-primary-color);
        color: var(--lumo-primary-contrast-color);
      }
    `;
  }

  render(): TemplateResult {
    return html` <section>
        <div class="crawl"></div>
      </section>
      <div class="card">

        <iframe
          src="https://challonge.com/DEFCON2/module"
          width="100%"
          height="500"
          frameborder="0"
          scrolling="auto"
          allowtransparency="true"
        ></iframe>
        <img class="defcon-image" src="/defcon-2-tagline.png" />
        
        <p>
          The WarYes DEFCON 2 Tournament is on the horizon! The 2v2 showdown of
          a lifetime, starting March 1st. The stage is set for a finale to
          remember on April 5-7th. Battle it out in a double elimination bracket
          that's bound to be filled with as much smack talk as strategic plays
          (and blunders).
        </p>

        <p>
          Here you can find all the links you need to enter the tournament,
          check the brackets, and read the rules. Good luck, and may the best
          team win!
        </p>

        <div class="button-grid">
          <a
            class="link-button primary"
            href="https://docs.google.com/forms/d/e/1FAIpQLSfNuhqxkOoxUKhMktGfdpzv9mdW05knfMIKum3eh70TYi9g-Q/viewform"
            >Sign up here!</a
          >
          <a
            class="link-button"
            href="https://docs.google.com/document/d/1QsQJbBs7mO5OSvdxJ9e8Yuv8x5vp-_VspbsJVgUVJO0"
            >Read the rules</a
          >
          <a class="link-button" href="https://challonge.com/DEFCON2"
            >Review the brackets</a
          >
          <a
            class="link-button"
            href="https://matcherino.com/tournaments/109548/overview"
            >Prize Pool</a
          >
          <a class="link-button" href="https://discord.com/invite/8vq6z3t"
            >Join the Discord</a
          >
        </div>
      </div>`;
  }
}
