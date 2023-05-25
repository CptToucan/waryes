import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {UnitsDatabaseService} from '../services/units-db';
import {Alliance, Unit /*Alliance*/} from '../types/unit';
import '../components/unit-image';
import '../components/country-flag';
import '../components/division-flag';
import '../components/simple-chip';
import '@vaadin/icon';
import {DivisionsDatabaseService} from '../services/divisions-db';
import {Division} from '../types/deck-builder';
import {PatchUnitRecord} from '../types/PatchUnitRecord';
import {RecordField} from '../types/RecordField';
import {getIconForTrait} from '../utils/get-icon-for-trait';
import {
  collection,
  orderBy,
  limit,
  query,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {FirebaseService} from '../services/firebase';
import "@vaadin/combo-box";
import { ComboBoxSelectedItemChangedEvent } from '@vaadin/combo-box';

interface Diff {
  __old: unknown;
  __new: unknown;
}

type ArrayDiffElement = ['~', any];

type ArrayDiffRemovedElement = ['-', any];

type ArrayDiffAddedElement = ['+', any];

type ArrayDiffDud = [' ', any];

type AnyDiffArrayElement =
  | ArrayDiffElement
  | ArrayDiffDud
  | ArrayDiffAddedElement
  | ArrayDiffRemovedElement;

type PatchedUnit = {
  patchRecord: PatchUnitRecord;
  divisions?: Division[];
};

type FirebasePatchRecord = {
  data: string;
  created: Timestamp;
  name: string;
};

@customElement('patch-notes-route')
export class PatchNotesRoute extends LitElement {
  static get styles() {
    return css`
      .page {
        padding: var(--lumo-space-m);
        
      }

      .card {
        display: flex;
        flex-direction: column;
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-s);
        border-radius: var(--lumo-border-radius-s);
        box-sizing: content-box;
        font-size: var(--lumo-font-size-s);
      }

      .header-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between
      }

      .arrow-icon {
        color: var(--lumo-primary-color);
        font-size: 0.5rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        grid-gap: var(--lumo-space-m);
      }

      .card-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      h1 {
        margin: 0;
      }
      h4 {
        margin: 0;
        margin-bottom: var(--lumo-space-s);
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1 1 0px;
      }

      a h4 {
        overflow: hidden;
      }

      a {
        color: var(--lumo-contrast);
        font-weight: bold;
      }

      a:visited {
        color: var(--lumo-contrast);
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
        height: 80px;
        width: 160px;
        border: 1px solid var(--lumo-contrast-20pct);
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
        flex-wrap: wrap;
      }
    `;
  }

  @state()
  patchNotes?: {
    added: PatchedUnit[];
    changed: PatchedUnit[];
    removed: PatchedUnit[];
  };

  @state()
  patches?: FirebasePatchRecord[];

  @state()
  selectedPatch?: FirebasePatchRecord;

  async onBeforeEnter() {
    // fetch patch notes from host

    // query firebase for patch
    const q = query(
      collection(FirebaseService.db, 'patches'),
      orderBy('created', 'desc'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);

    const patches = querySnapshot.docs.map((doc) =>
      doc.data()
    ) as FirebasePatchRecord[];

    this.patches = patches;

    await this.setupPatch(patches[0]);

  }

  async setupPatch(firebasePatchRecord: FirebasePatchRecord) {
    const patchNotesJson = JSON.parse(firebasePatchRecord.data);

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
    
    // sort by patchNote.unit alliance
    patchNotes.added.sort((a) => {
      return a.patchRecord.unitRecord.unit?.unitType.nationality ===
        Alliance.NATO
        ? -1
        : 1;
    });



    patchNotes.changed.sort((a, b) => {
      const allianceComparison = (alliance: Alliance) => {
        if (alliance === Alliance.NATO) {
          return -1;
        } else {
          return 1;
        }
      };
    
      const allianceComparisonResult = allianceComparison(a.patchRecord.unitRecord.unit?.unitType.nationality) - allianceComparison(b.patchRecord.unitRecord.unit?.unitType.nationality);
      if (allianceComparisonResult !== 0) {
        return allianceComparisonResult;
      }
    
      const motherCountryA = a.patchRecord.unitRecord.unit?.unitType?.motherCountry;
      const motherCountryB = b.patchRecord.unitRecord.unit?.unitType?.motherCountry;
    
      if (motherCountryA === motherCountryB) {
        return 0;
      }
    
      if (motherCountryA > motherCountryB) {
        return 1;
      }
    
      return -1;
    });
    
    this.selectedPatch = firebasePatchRecord;
    this.patchNotes = patchNotes;
  }

  render(): TemplateResult {
    if (this.patchNotes) {
      return html`
        <div class="page">
          <div class="header-bar">
            <h1>Patch Notes</h1>
            <vaadin-combo-box
              .items=${this.patches}
              .selectedItem=${this.selectedPatch}
              @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<FirebasePatchRecord>) => {
                if (e.detail.value) {
                  this.setupPatch(e.detail.value);
                }
              }}

              item-label-path="name"
            >
            </vaadin-combo-box>
          </div>
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

    const diffForTraits = patchNote.patchRecord.patch.diff.specialities;

    if (isAnyDiffElementArray(diffForTraits)) {

      for (const traitDiff of diffForTraits) {
        if (isArrayDiffAddedElement(traitDiff)) {
          outputHtml.push(
            html`<div>Added: ${getIconForTrait(traitDiff[1])}</div>`
          );
        }

        if (isArrayDiffRemovedElement(traitDiff)) {
          console.log(traitDiff[1]);
          outputHtml.push(
            html`<div>Removed: ${getIconForTrait(traitDiff[1])}</div>`
          );
        }
      }
    }

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
        outputHtml.push(
          html` <h4>${weaponRecord.weaponName.getFieldValue()}</h4> `
        );
        for (const field of weaponFields) {
          const diffForWeapon = patchNote.patchRecord.patch.diff?.weapons?.[i];
          const diffFields = diffForWeapon[1];
          const diff = diffFields[field.id];
          if (isDiff(diff)) {
            outputHtml.push(
              html`<div>
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
      if (isArrayDiffAddedElement(weaponDiffRecord)) {
        outputHtml.push(
          html`<div>Added ${weaponDiffRecord[1].weaponName}</div>`
        );
      }

      if (isArrayDiffRemovedElement(weaponDiffRecord)) {
        outputHtml.push(
          html`<div>Removed ${weaponDiffRecord[1].weaponName}</div>`
        );
      }
    }

    return html`<div>${outputHtml}</div>`;
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

  return (
    isDiffElement(diff) ||
    isDudElement(diff) ||
    isArrayDiffRemovedElement(diff) ||
    isArrayDiffAddedElement(diff)
  );
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

function isArrayDiffRemovedElement(
  diff: unknown
): diff is ArrayDiffRemovedElement {
  if (!Array.isArray(diff)) {
    return false;
  }
  const [key] = diff;
  return key === '-';
}

function isArrayDiffAddedElement(diff: unknown): diff is ArrayDiffAddedElement {
  if (!Array.isArray(diff)) {
    return false;
  }
  const [key] = diff;
  return key === '+';
}
