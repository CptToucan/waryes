import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {UnitsDatabaseService} from '../services/units-db';
import {Unit /*Alliance*/} from '../types/unit';
import '../components/unit-image';
import '../components/country-flag';
import '../components/division-flag';
import '../components/simple-chip';
import '@vaadin/icon';
import {DivisionsDatabaseService} from '../services/divisions-db';
import {Division} from '../types/deck-builder';
import {PatchUnitRecord} from '../types/PatchUnitRecord';
import {RecordField} from '../types/RecordField';

interface Diff {
  __old: unknown;
  __new: unknown;
}

type ArrayDiffElement = ['~', any];
type ArrayDiffDud = [' ', any];

type AnyDiffArrayElement = ArrayDiffElement | ArrayDiffDud;

type AnyDiff = Diff | AnyDiffArrayElement[];

type PatchedUnit = {
  patchRecord: PatchUnitRecord;
  divisions?: Division[];
};

function humanize(camelCaseString: string): string {
  // First, split the string by capital letters using a regular expression
  const words = camelCaseString.split(/(?=[A-Z])/);

  // Next, capitalize the first letter of each word and join them with a space
  const humanWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  const humanString = humanWords.join(' ');

  // Finally, return the resulting string
  return humanString;
}

@customElement('patch-notes-route')
export class PatchNotesRoute extends LitElement {
  static get styles() {
    return css`
      .card {
        display: flex;
        flex-direction: column;
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-s);
        border-radius: var(--lumo-border-radius-s);
        overflow: hidden;
        box-sizing: content-box;
        font-size: var(--lumo-font-size-s);
      }

      .arrow-icon {
        color: var(--lumo-primary-color);
        font-size: 0.5rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        grid-gap: var(--lumo-space-m);
        padding: var(--lumo-space-m);
      }

      .card-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      h4 {
        margin: 0;
        margin-bottom: var(--lumo-space-s);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        flex: 1 1 0px;
      }

      .card-header > a {
        flex: 1 1 0px;
        overflow: hidden;
      }

      unit-image {
        border-radius: var(--lumo-border-radius-s);
        overflow: hidden;
        height: 100%;
        width: unset;
        max-width: 160px;
      }

      .unit-images {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-s);
      }

      .nato {
        // background-color: rgba(1, 33, 105, 0.1);
        border: 2px solid rgba(1, 33, 105, 0.7);
      }

      .pact {
        // background-color: rgba(214, 0, 0, 0.1);
        border: 2px solid rgba(214, 0, 0, 0.7);
      }

      .flags {
        display: flex;
        flex-direction: column;
        flex: 1 1 0px;
        gap: var(--lumo-space-s);
        padding: var(--lumo-space-s);
        border-radius: var(--lumo-border-radius-s);
      }

      .division-flags {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-s);
      }
    `;
  }

  @state()
  patchNotes?: {
    added: PatchedUnit[];
    changed: PatchedUnit[];
    removed: PatchedUnit[];
  };

  async onBeforeEnter() {
    // fetch patch notes from host
    const patchNotesReq = await fetch('patch.json');
    const patchNotesJson = await patchNotesReq.json();

    const units = await UnitsDatabaseService.fetchUnits();

    if (!units) {
      return;
    }

    const unitMap: {[key: string]: Unit} = {};

    const unitDivisionsMap: {[key: string]: Division[]} = {};

    for (const unit of units) {
      unitMap[unit.descriptorName] = unit;

      const unitDivisions = await DivisionsDatabaseService.divisionsForUnit(
        unit
      );

      if (unitDivisions) {
        unitDivisionsMap[unit.descriptorName] = unitDivisions;
      } else {
        unitDivisionsMap[unit.descriptorName] = [];
      }
    }

    const patchNotes: {
      added: PatchedUnit[];
      changed: PatchedUnit[];
      removed: PatchedUnit[];
    } = {
      added: [],
      changed: [],
      removed: [],
    };

    for (const patchNote of patchNotesJson) {
      const unit = unitMap[patchNote.descriptorName];
      const divisions = unitDivisionsMap[patchNote.descriptorName];

      const patchUnitRecord = new PatchUnitRecord(patchNote, unit);
      if (patchNote.new) {
        patchNotes.added.push({divisions, patchRecord: patchUnitRecord});
      } else if (patchNote.removed) {
        patchNotes.removed.push({divisions, patchRecord: patchUnitRecord});
      } else {
        patchNotes.changed.push({divisions, patchRecord: patchUnitRecord});
      }
    }

    /*
    // sort by patchNote.unit alliance
    patchNotes.added.sort((a) => {
      return a.unit?.unitType.nationality === Alliance.NATO ? -1 : 1;
    });

    patchNotes.changed.sort((a) => {
      return a.unit?.unitType.nationality === Alliance.NATO ? -1 : 1;
    });
    */

    this.patchNotes = patchNotes;
  }

  async fetchUnitDivisions() {}

  render(): TemplateResult {
    if (this.patchNotes) {
      return html`
        <h3>Added ${this.patchNotes.added.length} Units</h3>
        <div class="grid">
          ${this.patchNotes.added.map((patchNote) => {
            return this.renderPatchNote(patchNote);
          })}
        </div>
        <h3>Changed ${this.patchNotes.changed.length} Units</h3>
        <div class="grid">
          ${this.patchNotes.changed.map((patchNote) => {
            return this.renderPatchNote(patchNote);
          })}
        </div>
        <h3>Removed ${this.patchNotes.removed.length} Units</h3>
        <div class="grid">
          ${this.patchNotes.removed.map((patchNote) => {
            return this.renderPatchNote(patchNote);
          })}
        </div>
      `;
    }

    return html``;
  }

  private renderPatchNote(patchNote: PatchedUnit) {
    return html` <div class="card">
      <div class="card-header">
        <a
          href="/unit/${patchNote.patchRecord.unitRecord.descriptorName.getFieldValue()}"
        >
          <h4>${patchNote.patchRecord.unitRecord.name.getFieldValue()}</h4>
        </a>
        ${patchNote.patchRecord.patch.new
          ? html`<simple-chip>New</simple-chip>`
          : ''}
      </div>
      <div class="unit-images">
        <unit-image .unit=${patchNote.patchRecord.unitRecord.unit}></unit-image>
        <div class="flags">
          <country-flag
            .country=${patchNote.patchRecord.unitRecord.unit?.unitType
              .motherCountry}
          ></country-flag>
          <div class="division-flags">
            ${patchNote.divisions?.map((division) => {
              return html`<division-flag
                .division=${division}
              ></division-flag>`;
            })}
          </div>
        </div>
      </div>
      ${!patchNote.patchRecord.patch.new
        ? html`${this.renderPatchNoteDiff(patchNote)}`
        : html``}
    </div>`;
  }

  private renderPatchNoteDiff(patchNote: PatchedUnit) {


    const unitFields = patchNote.patchRecord.unitRecord.getFields();
    const weapons = patchNote.patchRecord.unitRecord.weaponRecords;

    const outputHtml: TemplateResult[] = [];
    for (const field of unitFields) {
      const diffForField = patchNote.patchRecord.patch.diff[field.id];
      if (isDiff(diffForField)) {
        outputHtml.push(
          html` <div>
            ${field.getFieldNameDisplay()}:
            ${RecordField.getDisplayForValue(
              diffForField.__old,
              field.getFieldType()
            )}
            <vaadin-icon
              class="arrow-icon"
              .icon=${'vaadin:arrow-right'}
            ></vaadin-icon>
            ${RecordField.getDisplayForValue(
              diffForField.__new,
              field.getFieldType()
            )}
          </div>`
        );
      }
    }

    for (let i = 0; i < weapons.length; i++) {
      const weaponDiffRecord = patchNote.patchRecord.patch.diff?.weapons?.[i];
      const weaponRecord = weapons[i];

      if (isDiffElement(weaponDiffRecord)) {
        const weaponFields = weaponRecord.getFields();

        for (const field of weaponFields) {
          const diffForWeapon = patchNote.patchRecord.patch.diff?.weapons?.[i];
          console.log(diffForWeapon)
          const diffFields = diffForWeapon[1];
          const diff = diffFields[field.id];
          if (isDiff(diff)) {
            outputHtml.push(
              html` <div>
                ${field.getFieldNameDisplay()}:
                ${RecordField.getDisplayForValue(
                  diff.__old,
                  field.getFieldType()
                )}
                <vaadin-icon
                  class="arrow-icon"
                  .icon=${'vaadin:arrow-right'}
                ></vaadin-icon>
                ${RecordField.getDisplayForValue(
                  diff.__new,
                  field.getFieldType()
                )}
              </div>`
            );
          }
        }
      }
    }

    return html`${outputHtml}`;
  }

  _renderPatchNoteDiff(diff: {[key: string]: AnyDiff}): TemplateResult {
    // get keys of diff object and interate

    const diffKeys = Object.keys(diff);

    return html`
      <ul>
        ${diffKeys.map(
          (diffKey) => html`
            <li>${this.renderDiff(diffKey, diff[diffKey])}</li>
          `
        )}
      </ul>
    `;
  }

  renderDiff(diffKey: string, diff: any): TemplateResult {
    if (isDiff(diff)) {
      return html`
        <div>
          ${humanize(diffKey)}: ${diff.__old}
          <vaadin-icon
            class="arrow-icon"
            .icon=${'vaadin:arrow-right'}
          ></vaadin-icon>
          ${diff.__new}
        </div>
      `;
    }

    if ((diffKey || '').endsWith('__added')) {
      return html` <div>${diffKey}: ${diff}</div> `;
    } else if (isDiffElement(diff)) {
      return this.renderDiff(diffKey, diff[1]);
    } else if (isDudElement(diff)) {
      return html``;
    } else if (isAnyDiffElementArray(diff)) {
      return html`${this.renderDiffArray(diffKey, diff)}`;
    } else if (isAnyDiffElement(diff)) {
      return html`${this.renderDiff(diffKey, diff[1])}`;
    } else if (typeof diff === 'object' && diff !== null) {
      const diffKeys = Object.keys(diff);
      return html`
        <div>
          ${diffKey}
          <ul>
            ${diffKeys.map(
              (diffKey) => html`
                <li>${this.renderDiff(diffKey, diff[diffKey])}</li>
              `
            )}
          </ul>
        </div>
      `;
    } else {
      return html`<div>unknown diff type</div>`;
    }
  }

  renderDiffArray(
    diffKey: string,
    diff: AnyDiffArrayElement[]
  ): TemplateResult {
    return html`${diff.map(
      (diffElement) => html` ${this.renderDiff(diffKey, diffElement)} `
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'patch-notes-route': PatchNotesRoute;
  }
}

function isDiff(diff: unknown): diff is Diff {
  if (typeof diff !== 'object' || diff === null) {
    return false;
  }
  return '__old' in diff && '__new' in diff;
}

function isAnyDiffElementArray(diff: unknown): diff is AnyDiffArrayElement[] {
  if (!Array.isArray(diff)) {
    return false;
  }
  return diff.every((diffElement) => {
    return isAnyDiffElement(diffElement);
  });
}

function isAnyDiffElement(diff: unknown): diff is AnyDiffArrayElement {
  if (!Array.isArray(diff)) {
    return false;
  }
  const [key] = diff;
  return key === ' ' || key === '~';
}

function isDiffElement(diff: unknown): diff is ArrayDiffElement {
  if (!Array.isArray(diff)) {
    return false;
  }
  const [key] = diff;
  return key === '~';
}

function isDudElement(diff: unknown): diff is ArrayDiffDud {
  if (!Array.isArray(diff)) {
    return false;
  }
  const [key] = diff;
  return key === ' ';
}
