import { css } from "lit";

export const armouryCardStyles = css` :host {
  display: flex;
  flex-direction: column;
}
.main {
  background-color: var(--lumo-contrast-5pct);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  flex: 1 1 100%;

  border-radius: var(--lumo-border-radius-m);
  padding-left: var(--lumo-space-xs);
  padding-right: var(--lumo-space-xs);
  padding-top: var(--lumo-space-xs);
  padding-bottom: var(--lumo-space-xs);
  overflow: hidden;

  color: white;
}

.main.disabled {
  opacity: 50%;
}

.body {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.veterancy {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.veterancy > div:not(:last-child) {
  border-right: 1px solid var(--lumo-contrast-10pct);
}

.veterancy > div {
  flex: 1 1 100%;
  text-align: center;
  padding: var(--lumo-space-xs);
  cursor: pointer;
  border: 1px solid transparent;
}

.veterancy > div.active {
  background-color: var(--lumo-contrast-10pct);
  border: 1px solid var(--lumo-primary-color-50pct);
}

.veterancy > div.disabled {
  opacity: 20%;
  cursor: initial;
  pointer-events: none;
}

.main.disabled .veterancy > div {
  pointer-events: none !important;
}

.points {
  position: absolute;
  bottom: 0;
  right: 0;
  color: var(--lumo-primary-color);
  font-size: var(--lumo-font-size-s);
}

.add-button {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
}

.info-icon-button {
  position: absolute;
  top: 0px;
  right: 0px;
  color: var(--lumo-contrast-70pct);
  margin: 0;
//  height: 18px;
//  width: 18px;
}

.name {
  margin-left: var(--lumo-space-l);
  margin-right: var(--lumo-space-l);
  font-size: 12px;
  display: flex;
  align-items: center;
  text-align: center;
  height: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quantity {
  position: absolute;
  bottom: 0;
  left: 0;
  color: var(--lumo-contrast-70pct);
  font-size: var(--lumo-font-size-s);
}

.top-section {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  padding-top: var(--lumo-space-xs);
  width: 100%;
  border-bottom: 1px solid var(--lumo-contrast-10pct);
}

.bottom-section {
  display: flex;
  position: relative;
  align-items: space-between;
  justify-content: center;
  width: 100%;
  flex: 1 1 100%;
  border-bottom: 1px solid var(--lumo-contrast-10pct);
}

.remaining {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--lumo-contrast-70pct);
}



unit-image {
  margin-bottom: var(--lumo-space-s);
}
`
