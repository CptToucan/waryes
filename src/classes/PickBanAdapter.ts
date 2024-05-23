import {FirebaseService} from '../services/firebase';
import {
  PickBanConfig,
  PickBanConfigWithId,
  PickBanSession,
} from '../types/PickBanTypes';
import {StrapiAdapter} from './StrapiAdapter';

export class PickBanAdapter {
  static apiUrl: string = `${process.env.API_URL}`;
  static strapiUrl: string = `${process.env.STRAPI_URL}`;

  static async createSession(configId: number, team?: number) {
    try {
      const user = FirebaseService.auth.currentUser;

      if (!user) {
        throw new Error('User not logged in.');
      }

      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/create-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            configId,
            team,
          }),
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const json: {
        message: string;
        session: {
          code: string;
          id: string;
          session: PickBanSession;
        };
      } = await response.json();

      return json;
    } catch (error) {
      console.error('Error creating draft session:', error);
      throw error;
    }
  }

  static async joinSessionWithCode(code: string) {
    try {
      const user = FirebaseService.auth.currentUser;

      if (!user) {
        throw new Error('User not logged in.');
      }

      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/join-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            code,
          }),
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const json: {
        session: {
          id: string;
          session: PickBanSession;
        };
      } = await response.json();

      return json;
    } catch (error) {
      console.error('Error joining draft session:', error);
      throw error;
    }
  }

  static async startSession(sessionId: string) {
    try {
      const user = FirebaseService.auth.currentUser;

      if (!user) {
        throw new Error('User not logged in.');
      }

      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/session/${sessionId}/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error starting draft session:', error);
      throw error;
    }
  }

  static async leaveSession(sessionId: string) {
    try {
      const user = FirebaseService.auth.currentUser;

      if (!user) {
        throw new Error('User not logged in.');
      }

      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/session/${sessionId}/leave`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error leaving draft session:', error);
      throw error;
    }
  }

  static async endSession(sessionId: string) {
    try {
      const user = FirebaseService.auth.currentUser;

      if (!user) {
        throw new Error('User not logged in.');
      }

      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/session/${sessionId}/end`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error ending draft session:', error);
      throw error;
    }
  }

  static async pick(sessionId: string, pick: number) {
    try {
      const user = FirebaseService.auth.currentUser;

      if (!user) {
        throw new Error('User not logged in.');
      }

      if(pick === undefined) {
        throw new Error('No pick selected');
      }

      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/session/${sessionId}/pick`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            pick,
          }),
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error making draft pick:', error);
      throw error;
    }
  }

  static async ban(sessionId: string, ban: number) {
    try {
      const user = FirebaseService.auth.currentUser;

      if (!user) {
        throw new Error('User not logged in.');
      }

      if(ban === undefined) {
        throw new Error('No ban selected');
      }

      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/session/${sessionId}/ban`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            ban,
          }),
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error making draft ban:', error);
      throw error;
    }
  }

  static async pickSide(sessionId: string, side: string) {
    try {
      const user = FirebaseService.auth.currentUser;

      console.log(side);

      if (!user) {
        throw new Error('User not logged in.');
      }

      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/session/${sessionId}/pick-side`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            side,
          }),
        }
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error picking draft side:', error);
      throw error;
    }
  }

  static async getSession(sessionId: string) {
    try {
      const response = await fetch(
        `${PickBanAdapter.apiUrl}/pick-ban/session/${sessionId}`
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }
      
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error getting draft session:', error);
      throw error;
    }
  }

  static async loadAvailableConfigs() {
    try {
      const configsJson = await StrapiAdapter.getPickBanConfigs();
      const configs: PickBanConfigWithId[] = configsJson.data.map(
        (config: {id: number; attributes: {Config: PickBanConfig}}) => {
          return {...config.attributes.Config, id: config.id};
        }
      );

      return configs;
    } catch (error) {
      console.error('Error loading available configs:', error);
      throw error;
    }
  }
}
