import { LitElement, html, css, customElement, property } from 'lit-element';



@customElement('progress-bar')
export class ProgressBar extends LitElement {
  @property({ type: Number }) percent = 0;

  banding = [
    { class: "exceptional", percent: 80 },
    { class: "good", percent: 60 },
    { class: "average", percent: 40 },
    { class: "bad", percent: 20 },
    { class: "very-bad", percent: 0 },
  ];

  static get styles() {
    return css`

      :host {
        display: block;
        height: 24px;
        background-color: var(--lumo-contrast-10pct);
        overflow: hidden;
      }

      .progress {
        height: 100%;
        transition: width 0.3s ease-in-out;
      }

      .exceptional {
        background-color: var(--warno-exceptional-40pct);
        border-right: 4px solid var(--warno-exceptional);
      }



      .good {
        background-color: var(--warno-good-40pct);
        border-right: 4px solid var(--warno-good);
      }

      .average {
        background-color: var(--warno-average-40pct);
        border-right: 4px solid var(--warno-average);
      }

      .bad {
        background-color: var(--warno-bad-40pct);
        border-right: 4px solid var(--warno-bad);
      }

      .very-bad {
        background-color: var(--warno-very-bad-40pct);
        border-right: 4px solid var(--warno-very-bad);
      }
    `;
  }

  render() {
    const band = this.banding.find(b => this.percent >= b.percent);
    console.log(this.percent);
    return html`
      <div class="progress ${band?.class}" style="width: calc(${this.percent}% - 4px);}"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'progress-bar': ProgressBar;
  }
}