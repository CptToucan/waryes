export interface DeckDraftEngine {
  initializeDraft(): Promise<void>;

  chooseOption(choice: number): Promise<void>;

  completeDraft(): Promise<string>;

  callbacks: Function[]; // Array to store registered callbacks

  // Trigger all registered callbacks
  fireCallbacks(): void;
}
