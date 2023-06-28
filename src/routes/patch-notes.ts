import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Alliance, Unit} from '../types/unit';
import '../components/unit-image';
import '../components/country-flag';
import '../components/division-flag';
import '../components/simple-chip';
import '@vaadin/icon';
import '@vaadin/button';
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
import '@vaadin/combo-box';
import {ComboBoxSelectedItemChangedEvent} from '@vaadin/combo-box';
import {BucketFolder, BundleManagerService} from '../services/bundle-manager';
import {DivisionsMap} from '../types/deck-builder';

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

type FirebasePatchRecord = {
  data: string;
  created: Timestamp;
  name: string;
};

type PatchNoteTypes = {
  added: PatchUnitRecord[];
  changed: PatchUnitRecord[];
  removed: PatchUnitRecord[];
};

enum ViewMode {
  DIVISION = 'division',
  UNIT = 'unit',
}

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
        justify-content: space-between;
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

      division-flag.unit-division {
        width: 30px;
      }

      country-flag {
        width: 30px;
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

      .division-header {
        display: flex;
        flex-direction: row;
        gap: var(--lumo-space-s);
      }

      .division-container {
        background-color: var(--lumo-contrast-5pct);
        padding: var(--lumo-space-s);
        margin-bottom: var(--lumo-space-m);
        border-radius: var(--lumo-border-radius);
      }
    `;
  }

  @state()
  patchNotes?: PatchNoteTypes;

  @state()
  patches?: FirebasePatchRecord[];

  @state()
  divisionsMap?: DivisionsMap;

  @state()
  patchNotesByDivision?: {[key: string]: PatchNoteTypes};

  @state()
  viewMode: ViewMode = ViewMode.DIVISION;

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

    const units = await BundleManagerService.getUnitsForBucket(
      BucketFolder.WARNO
    );

    const divisions = await BundleManagerService.getDivisionsForBucket(
      BucketFolder.WARNO
    );

    const divisionMap: DivisionsMap = {};

    // sort divisions by alliance
     
    const sortedDivisions = divisions?.sort((a, b) => {
      if (a.alliance === b.alliance) {
        return 0;
      }

      if (a.alliance === Alliance.NATO) {
        return -1;
      }

      if (a.alliance === Alliance.PACT) {
        return 1;
      }
      return 0;
    });


    if (sortedDivisions) {
      for (const division of sortedDivisions) {
        divisionMap[division.descriptor] = division;
      }
    }

    this.divisionsMap = divisionMap;

    if (!units || !sortedDivisions) {
      return;
    }

    const unitMap: {[key: string]: Unit} = {};

    for (const unit of units) {
      unitMap[unit.descriptorName] = unit;
    }

    const patchNotes: PatchNoteTypes = {
      added: [],
      changed: [],
      removed: [],
    };

    for (const patchNote of patchNotesJson) {
      const unit = unitMap[patchNote.descriptorName];

      const patchUnitRecord = new PatchUnitRecord(patchNote, unit);

      if (patchNote.new) {
        patchNotes.added.push(patchUnitRecord);
      } else if (patchNote.removed) {
        patchNotes.removed.push(patchUnitRecord);
      } else {
        patchNotes.changed.push(patchUnitRecord);
      }
    }

    const divisionUnitMap: {[key: string]: PatchNoteTypes} = {};
    for (const division of sortedDivisions) {
      // create map of arrays of units in divisions

      if (!divisionUnitMap[division.descriptor]) {
        divisionUnitMap[division.descriptor] = {
          added: [],
          changed: [],
          removed: [],
        };
      }

      // add all the patch units for units in this division to the array

      for (const patchUnit of patchNotes.added) {
        if (
          patchUnit.unitRecord.unit?.divisions.find(
            (_div) => division.descriptor === _div
          )
        ) {
          divisionUnitMap[division.descriptor].added.push(patchUnit);
        }
      }

      for (const patchUnit of patchNotes.changed) {
        if (
          patchUnit.unitRecord.unit?.divisions.find(
            (_div) => division.descriptor === _div
          )
        ) {
          divisionUnitMap[division.descriptor].changed.push(patchUnit);
        }
      }
    }
    // sort by patchNote.unit alliance
    patchNotes.added.sort((a) => {
      return a.unitRecord.unit?.unitType.nationality === Alliance.NATO ? -1 : 1;
    });

    patchNotes.changed.sort((a, b) => {
      const allianceComparison = (alliance: Alliance) => {
        if (alliance === Alliance.NATO) {
          return -1;
        } else {
          return 1;
        }
      };

      const allianceComparisonResult =
        allianceComparison(a.unitRecord.unit?.unitType.nationality) -
        allianceComparison(b.unitRecord.unit?.unitType.nationality);
      if (allianceComparisonResult !== 0) {
        return allianceComparisonResult;
      }

      const motherCountryA = a.unitRecord.unit?.unitType?.motherCountry;
      const motherCountryB = b.unitRecord.unit?.unitType?.motherCountry;

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
    this.patchNotesByDivision = divisionUnitMap;
  }

  async fetchDivisionMap() {
    const divisions = await BundleManagerService.getDivisionsForBucket(
      BucketFolder.WARNO
    );
    const divisionMap: DivisionsMap = {};

    if (divisions) {
      for (const division of divisions) {
        divisionMap[division.descriptor] = division;
      }
    }

    return divisionMap;
  }

  render(): TemplateResult {
    if (this.patchNotes && this.patchNotesByDivision) {
      return html`
        <div class="page">
          <div class="header-bar">
            <h1>Patch Notes</h1>
            <div>
              <vaadin-combo-box
                .items=${this.patches}
                .selectedItem=${this.selectedPatch}
                @selected-item-changed=${(
                  e: ComboBoxSelectedItemChangedEvent<FirebasePatchRecord>
                ) => {
                  if (e.detail.value) {
                    this.setupPatch(e.detail.value);
                  }
                }}
                item-label-path="name"
              >
              </vaadin-combo-box>

              <vaadin-button
                @click=${() => {
                  if (this.viewMode === ViewMode.DIVISION) {
                    this.viewMode = ViewMode.UNIT;
                  } else {
                    this.viewMode = ViewMode.DIVISION;
                  }
                }}
              >
                ${this.viewMode === ViewMode.DIVISION
                  ? 'Division View'
                  : 'Unit View'}
              </vaadin-button>
            </div>
          </div>

          ${this.viewMode === ViewMode.DIVISION
            ? this.renderDivisionView(this.patchNotesByDivision)
            : this.renderUnitView(this.patchNotes)}
        </div>
      `;
    }

    return html``;
  }

  renderDivisionView(patchNotes: {[key: string]: PatchNoteTypes}) {
    return html`
      ${Object.keys(patchNotes).map((division) => {
        return html` <div class="division-container">
          <div class="division-header">
            <division-flag
              .division=${this.divisionsMap?.[division]}
              .divisionId=${division}
            >
            </division-flag>
            <h3>${this.divisionsMap?.[division]?.name || division}</h3>
          </div>
          ${this.renderUnitView(patchNotes[division])}
        </div>`;
      })}
    `;
  }

  renderUnitView(patchNotes: PatchNoteTypes) {
    return html` <h3>${patchNotes.added.length} New Units</h3>
      <div class="grid">
        ${patchNotes.added.map((patchNote) => {
          return this.renderPatchNote(patchNote);
        })}
      </div>
      <h3>${patchNotes.changed.length} Changed Units</h3>
      <div class="grid">
        ${patchNotes.changed.map((patchNote) => {
          return this.renderPatchNote(patchNote);
        })}
      </div>`;
  }

  private renderPatchNote(patchNote: PatchUnitRecord) {
    return html` <div class="card">
      <div class="card-header">
        <a href="/unit/${patchNote.unitRecord.descriptorName.getFieldValue()}">
          <h4>${patchNote.unitRecord.name.getFieldValue()}</h4>
        </a>
        ${patchNote.patch.new ? html`<simple-chip>New</simple-chip>` : ''}
      </div>
      <div class="unit-images">
        <unit-image .unit=${patchNote.unitRecord.unit}></unit-image>
        <div class="flags">
          <country-flag
            .country=${patchNote.unitRecord.unit?.unitType.motherCountry}
          ></country-flag>
          <div class="division-flags">
            ${patchNote.unitRecord.unit.divisions?.map((division) => {
              return html`<division-flag
                class="unit-division"
                .divisionId=${division}
              ></division-flag>`;
            })}
          </div>
        </div>
      </div>
      ${!patchNote.patch.new
        ? html`${this.renderPatchNoteDiff(patchNote)}`
        : html``}
    </div>`;
  }

  private renderPatchNoteDiff(patchNote: PatchUnitRecord) {
    const unitFields = patchNote.unitRecord.getFields();
    const weapons = patchNote.unitRecord.weaponRecords;

    const outputHtml: TemplateResult[] = [];

    const diffForDivisions = patchNote.patch.diff.divisions;

    if (isAnyDiffElementArray(diffForDivisions)) {
      for (const divisionDiff of diffForDivisions) {
        if (isArrayDiffAddedElement(divisionDiff)) {
          outputHtml.push(
            html`<div>
              Added to:
              <division-flag
                class="unit-division"
                .divisionId=${divisionDiff[1]}
              ></division-flag>
            </div>`
          );
        }

        if (isArrayDiffRemovedElement(divisionDiff)) {
          outputHtml.push(
            html`<div>
              Removed from:
              <division-flag .divisionId=${divisionDiff[1]}></division-flag>
            </div>`
          );
        }
      }
    }

    const diffForTraits = patchNote.patch.diff.specialities;

    if (isAnyDiffElementArray(diffForTraits)) {
      for (const traitDiff of diffForTraits) {
        if (isArrayDiffAddedElement(traitDiff)) {
          outputHtml.push(
            html`<div>Added: ${getIconForTrait(traitDiff[1])}</div>`
          );
        }

        if (isArrayDiffRemovedElement(traitDiff)) {
          outputHtml.push(
            html`<div>Removed: ${getIconForTrait(traitDiff[1])}</div>`
          );
        }
      }
    }

    for (const field of unitFields) {
      const diffForField = patchNote.patch.diff[field.id];
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
      const weaponDiffRecord = patchNote.patch.diff?.weapons?.[i];
      const weaponRecord = weapons[i];

      if (isDiffElement(weaponDiffRecord)) {
        const weaponFields = weaponRecord.getFields();
        outputHtml.push(
          html` <h4>${weaponRecord.weaponName.getFieldValue()}</h4> `
        );

        if (
          weaponDiffRecord[1]?.imageTexture?.__old ||
          weaponDiffRecord[1]?.imageTexture?.__new
        )
          outputHtml.push(
            html` <div>
              Image Texture: ${weaponDiffRecord[1].imageTexture.__old}
              <vaadin-icon
                class="arrow-icon"
                .icon=${'vaadin:arrow-right'}
              ></vaadin-icon>
              ${weaponDiffRecord[1].imageTexture.__new}
            </div>`
          );

        for (const field of weaponFields) {
          const diffForWeapon = patchNote.patch.diff?.weapons?.[i];
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
