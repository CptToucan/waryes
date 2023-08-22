import {User} from 'firebase/auth';
import {DeckDraftEngine} from './DeckDraftEngineInterface';

const BASE_URL = 'https://europe-west1-catur-11410.cloudfunctions.net';

export class DeckDraftServerEngine implements DeckDraftEngine {
  constructor(user: User) {
    this.user = user;
  }

  user: User;



  callbacks: Function[] = []; // Array to store registered callbacks
  fireCallbacks(): void {
  }

  private _sessionId?: string | undefined;

  public get sessionId(): string | undefined {
    return this._sessionId;
  }

  public set sessionId(value: string | undefined) {
    this._sessionId = value;
  }

  async getHeaders(user: User): Promise<Headers> {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${await user.getIdToken()}`);
    return headers;
  }


  // I think this should be moved to a factory function
  // that returns a DeckDraftServerEngine instance with the sessionId set
  async initializeDraft() {
    const user = this.user;
    const response = await fetch(`${BASE_URL}/startDeckDraft`, {
      method: 'POST',
      headers: await this.getHeaders(user),
    });

    if(response.ok) {
      const sessionId = (await response.json()).sessionId as string;
      this.sessionId = sessionId;
      return;
    }

    throw new Error('Failed to create draft session.');
  }

  async chooseOption(choice: number) {
    const user = this.user;
    const response = await fetch(`${BASE_URL}/deckDraftChoose`, {
      method: 'POST',
      headers: await this.getHeaders(user),
      body: JSON.stringify({
        sessionId: this.sessionId,
        choice,
      }),
    });

    if(response.ok) {
      return;
    }

    throw new Error('Failed to choose option.');
  }

  async completeDraft() {
    const user = this.user;
    const response = await fetch(`${BASE_URL}/deckDraftComplete`, {
      method: 'POST',
      headers: await this.getHeaders(user),
      body: JSON.stringify({
        sessionId: this.sessionId,
      }),
    });

    if(response.ok) {
      const responseContent = await response.json();
      return responseContent.deckCode as string;
    }

    throw new Error('Failed to complete draft.');
  }


}
