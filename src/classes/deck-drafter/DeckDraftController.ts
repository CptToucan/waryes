import { DeckDraftEngine } from "./DeckDraftEngineInterface";

export class DeckDraftController {
  constructor(engine: DeckDraftEngine) {
    this.engine = engine;
  }

  engine: DeckDraftEngine;
  deckCode?: string;

  // Register a callback function
  registerCallback(callback: Function) {
    this.engine.callbacks.push(callback);
  }

  // Unregister a callback function
  unregisterCallback(callback: Function) {
    const index = this.engine.callbacks.indexOf(callback);
    if (index !== -1) {
      this.engine.callbacks.splice(index, 1);
    }
  }



  async chooseOption(choice: number) {
    await this.engine.chooseOption(choice);
    await this.engine.fireCallbacks(); // Trigger callbacks when option is chosen
    return 
  }

  async completeDraft() {
    const deckCode = await this.engine.completeDraft();
    this.deckCode = deckCode;
    this.engine.fireCallbacks(); // Trigger callbacks when draft is completed
    return deckCode;
  }
}
