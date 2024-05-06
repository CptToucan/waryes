import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import showdown from 'showdown';
import "./tooltip-renderer";

@customElement('markdown-renderer')
export class MarkdownRenderer extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
        justify-content: center;
        align-items: center;
      }
      p, ul, h1, h2, h3, h4, h5, h6 {
        width: 100%;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin: 0;
        margin-bottom: var(--lumo-space-s);
        font-weight: bold;
        color: var(--lumo-contrast);
      }

      img {
        max-width: 100%;
        border-radius: var(--lumo-border-radius);
        max-width: 75%;
        align-self: center;
      }

      p {
        width: 100%;
        margin: 0;
        margin-bottom: var(--lumo-space-m);
        gap: var(--lumo-space-m);
        text-align: justify;
        color: var(--lumo-contrast-90pct);
      }

      table {
        margin-bottom: var(--lumo-space-m);
      }

      p img {
        display: block;
        margin-left: auto;
        margin-right: auto;
      }

      ul {
        margin: 0;
        margin-bottom: var(--lumo-space-m);
      }

      th {
        background-color: var(--lumo-contrast-10pct);
        padding: var(--lumo-space-s);
      }

      td {
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-s);
        font-size: var(--lumo-font-size-s);
      }
    `;
  }

  @property()
  markdown: string = '';

  render() {
    const extension = {
      type: 'lang',
      filter: (text: string) => {
        const pattern = /\^\^tooltip\s+([\s\S]*?)\^\^/g;
        const replacement =
          '<tooltip-renderer tooltipId="$1"></tooltip-renderer>';
        const replacedString = text.replace(pattern, replacement);
        return replacedString;
      },
    };

    showdown.extension('myext', extension);
    showdown.setOption('tables', true);
    const converter = new showdown.Converter({
      extensions: ['myext'],
    });
    const text = this.markdown;
    const mdHtml = converter.makeHtml(text);
    return html`${unsafeHTML(mdHtml)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'markdown-renderer': MarkdownRenderer;
  }
}


//<span id="test" style="display: inline">$1</span><vaadin-tooltip text="Some random text" for="test" position="top"></vaadin-tooltip>