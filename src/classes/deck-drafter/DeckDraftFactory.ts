/**
 * Deck Draft Factory
 * Creates a new DeckDraftEngine instance with the sessionId set for the ServerEngine
 * The ClientEngine does not need a sessionId or a User
 */

import {DeckDraftServerEngine} from './DeckDraftServerEngine';
import {User} from 'firebase/auth';
import {DeckDraftClientEngine} from './DeckDraftClientEngine';

export class DeckDraftFactory {
  static async createServerEngine(user: User): Promise<DeckDraftServerEngine> {
    const engine = new DeckDraftServerEngine(user);
    await engine.initializeDraft();
    return engine;
  }

  static async createServerEngineForSessionId(
    user: User,
    sessionId: string
  ): Promise<DeckDraftServerEngine> {
    const engine = new DeckDraftServerEngine(user);
    engine.sessionId = sessionId;

    return engine;
  }

  static async createClientEngine(): Promise<DeckDraftClientEngine> {
    const engine = new DeckDraftClientEngine();
    await engine.initializeDraft();
    return engine;
  }

  static async createEngineFromLocalStorage(
  ): Promise<DeckDraftClientEngine> {
    const engine = new DeckDraftClientEngine();
    await engine.initializeUnitAndDivisionData();
    engine.state = await engine.getStateFromLocalStorage();
    return engine;
  }


}
