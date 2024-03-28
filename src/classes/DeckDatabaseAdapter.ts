import { getAuth } from "firebase/auth";

export interface DeckRecord {
  id: number;
  name: string;
  code: string;
  public: boolean;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  division: string;
  country: string;
  creator: string;
  youtubeLink?: string;
}

export interface DeckCreateRequestBody {
  /*
  tags: selectedTags.toString(),
  division: deck.division.descriptor,
  code: deck.toDeckCode(),
  name: deckName,
  creator: getAuth().currentUser?.uid,
  copiedFrom: copiedDeckId,
  public: isPublic,
  */

  tags: string;
  code: string,
  name: string;
  copiedFrom: number;
  public: boolean;
}

export interface DeckCollectionApiResponse {
  data: DeckRecord[];
  meta: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

export interface UserdeckCollectionApiResponse {
  data: DeckRecord[];
  meta: {
    totalAllowedDecks: number;
    totalDecks: number;
  };

}

export interface DeckCreateApiResponse {
  data: DeckRecord;
  meta: {};
}

export interface DeckGetApiResponse {
  data: DeckRecord;
  meta: {};
}

export interface DeckQueryBody {
  division?: string;
  tags: string[];
  pro: boolean;
}

export interface DeckUpdateRequestBody {
  code?: string;
  public?: boolean;
  name?: string;
  youtubeLink?: string;
}

export class DeckDatabaseAdapter {
  static apiUrl: string = `${process.env.API_URL}`;

  static async createDeck(deckData: DeckCreateRequestBody): Promise<DeckCreateApiResponse> {

    const user = getAuth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const response = await fetch(`${DeckDatabaseAdapter.apiUrl}/deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify(deckData),
    });

    if (!response.ok) {
      throw new Error('Failed to create deck');
    }

    return response.json();
  }

  static async getDeck(deckId: number): Promise<DeckGetApiResponse> {
    const response = await fetch(`${DeckDatabaseAdapter.apiUrl}/deck/${deckId}`);

    if (!response.ok) {
      throw new Error('Failed to get deck');
    }

    return response.json();
  }

  static async updateDeck(deckId: number, deckData: DeckUpdateRequestBody): Promise<any> {
    const response = await fetch(`${DeckDatabaseAdapter.apiUrl}/deck/${deckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuth().currentUser?.getIdToken()}`,
      },
      body: JSON.stringify(deckData),
    });

    if (!response.ok) {
      throw new Error('Failed to update deck');
    }

    return response.json();
  }

  static async deleteDeck(deckId: number): Promise<void> {
    const response = await fetch(`${DeckDatabaseAdapter.apiUrl}/deck/${deckId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuth().currentUser?.getIdToken()}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete deck');
    }
  }

  static async getDecks(page: number, limit: number, query?: DeckQueryBody): Promise<DeckCollectionApiResponse> {
    let queryString = '';
    if (query) {
      const { division, tags, pro } = query;
      const params: { division?: string, tags?: string, pro?: string } = {};
      if (division) {
        params.division = division.toString();
      }
      if (tags && tags.length > 0) {
        params.tags = tags.join(',');
      }
      if (pro) {
        params.pro = pro.toString();
      }
      queryString = new URLSearchParams(params).toString();
    }
    const url = `${DeckDatabaseAdapter.apiUrl}/deck?page=${page}&limit=${limit}&${queryString}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to get decks');
    }
    return response.json();
  }

  static async getUserDecks(): Promise<UserdeckCollectionApiResponse> {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const response = await fetch(`${DeckDatabaseAdapter.apiUrl}/deck/user`, {
      headers: {
        'Authorization': `Bearer ${await user.getIdToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user decks');
    }

    return response.json();
  }
}
