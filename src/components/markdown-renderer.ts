import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import showdown from 'showdown';

@customElement('markdown-renderer')
export class MarkdownRenderer extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
        overflow-x: auto;
        justify-content: center;
        align-items: center;
      }
      * {
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
        display: flex;
        flex-direction: column;
        gap: var(--lumo-space-m);
        text-align: justify;
        color: var(--lumo-contrast-90pct);
      }

      ul {
        margin: 0;
        margin-bottom: var(--lumo-space-m);
      }
    `;
  }

  @property()
  markdown: string = '';

  render() {
    const extension = {
      type: 'lang',
      filter: (text: string) => {
        const pattern = /\^\^tooltip\s+(\S+)/g;
        const replacement = '<span id="test">Test</span><vaadin-tooltip text=$1 for="test" position="top">$1</vaadin-tooltip>';
        const replacedString = text.replace(pattern, replacement);
        console.log(replacedString);
        return replacedString;
      },
    };

    showdown.extension('myext', extension);
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
