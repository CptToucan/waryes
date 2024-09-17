import {css} from 'lit';

export const armouryCardStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    max-width: 150px;
  }
  .main {
    background-color: var(--lumo-contrast-5pct);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: stretch;
    flex: 1 1 100%;

    border-radius: var(--lumo-border-radius-m);

    color: white;
  }

  .main.disabled {
    opacity: 50%;
  }

  .body {
    width: 100%;
    display: flex;
    flex-direction: row;
    min-height: 76px;
    min-width: 150px;
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

  .traits {
    display: flex;
    padding: var(--lumo-space-xs);
    gap: var(--lumo-space-s);
    border-bottom: 1px solid var(--lumo-contrast-10pct);
    width: 100%;
    box-sizing: border-box;    
    font-size: var(--lumo-font-size-xs);
    min-height: 20px;
    justify-content: space-around;
    color: var(--lumo-contrast-60pct);
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
    font-size: var(--lumo-font-size-s);
    background-color: hsla(240, 7%, 11%, 0.8);
    padding-left: var(--lumo-space-xs);
    padding-right: var(--lumo-space-xs);
    border-top-left-radius: var(--lumo-border-radius-s);
  }

  .add-button {
    position: absolute;
    top: var(--lumo-space-xs);
    left: var(--lumo-space-xs);
    margin: 0;
  }

  .info-icon-button {
    position: absolute;
    top: var(--lumo-space-xs);
    right:  var(--lumo-space-xs);
  
    margin: 0;
    border-bottom-left-radius: var(--lumo-border-radius-s);
    // color: var(--lumo-primary-color);
    --lumo-primary-color: hsla(240, 7%, 11%, 0.8);
    padding: 0;
    //  height: 18px;
    //  width: 18px;
  }

  .name {
    margin-left: var(--lumo-space-l);
    margin-right: var(--lumo-space-xs);
    font-size: 0.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1 1 0;
  }

  .quantity {
    position: absolute;
    bottom: 0;
    left: 0;

    border-top-right-radius: var(--lumo-border-radius-s);

    font-size: var(--lumo-font-size-s);
    background-color: hsla(240, 7%, 11%, 0.8);
    padding-left: var(--lumo-space-xs);
    padding-right: var(--lumo-space-xs);
  }

  .top-section {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
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
    font-size: 0.6rem;
    left: 0;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--lumo-contrast-70pct);
  }

  unit-image {
    // margin-bottom: var(--lumo-space-s);
    min-height: 76px;
  }
`;
