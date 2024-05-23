export interface PickBanConfig {
  name: string;
  mode: MODE;
  stages: PickBanStage[];
  topicPools: {
    [POOL_TYPE.MAP]: {
      type: POOL_TYPE.MAP;
      pool: string[];
    };
    [POOL_TYPE.DIVISION]: {
      NATO: {
        type: POOL_TYPE.DIVISION;
        pool: string[] | DIVISION_POOL_PRESET.ALL_NATO_DIVISIONS;
      };
      PACT: {
        type: POOL_TYPE.DIVISION;
        pool: string[] | DIVISION_POOL_PRESET.ALL_PACT_DIVISIONS;
      };
      NEUTRAL: {
        type: POOL_TYPE.DIVISION;
        pool: string[] | DIVISION_POOL_PRESET.ALL_DIVISIONS;
      };
    };
  };
}

export interface LivePool {
  type: POOL_TYPE;
  pool: {
    original: string[];
    available: string[];
    selected: PickBanSelectedItem[];
    banned: PickBanSelectedItem[];
  };
}

export enum MODE {
  NATO_V_PACT = "NATO_V_PACT",
  NATO_V_NATO = "NATO_V_NATO",
  PACT_V_PACT = "PACT_V_PACT",
  ALL_V_ALL = "ALL_V_ALL",
}

export interface PickBanConfigWithId extends PickBanConfig {
  id: number;
}

export enum TEAM_ASSIGNMENT {
  MANUAL = "MANUAL",
  RANDOM = "RANDOM",
}

export interface PickBanStage {
  name: string;
  type: PICK_TYPE;
  team: number;
  poolType?: POOL_TYPE;
}

export enum PICK_TYPE {
  PICK = "PICK",
  BAN = "BAN",
  SIDE_PICK = "SIDE_PICK",
}

export enum POOL_TYPE {
  MAP = "MAP",
  DIVISION = "DIVISION",
}

export enum DIVISION_POOL_PRESET {
  ALL_NATO_DIVISIONS = "ALL_NATO_DIVISIONS",
  ALL_PACT_DIVISIONS = "ALL_PACT_DIVISIONS",
  ALL_DIVISIONS = "ALL_DIVISIONS",
}

export interface UserDescriptor {
  id: string;
  name: string;
  side?: DIVISION_ALLIANCE;
}

export interface PickBanSelectedItem {
  user: UserDescriptor;
  item: string;
}

export interface HistoryItem {
  selectedItem: PickBanSelectedItem;
  stage: PickBanStage;
}

export interface PickBanPool {
  type: POOL_TYPE;
  pool: {
    original: string[];
    available: string[];
    selected: PickBanSelectedItem[];
    banned: PickBanSelectedItem[];
  };
}

export interface PickBanSession {
  config: PickBanConfig;
  currentStageIndex?: number;
  activeTeam?: number;
  activeUser?: UserDescriptor | null;
  teamAssignment?: TEAM_ASSIGNMENT;
  finished: boolean;
  history: HistoryItem[];
  pools?: {
    [POOL_TYPE.MAP]: LivePool;
    [POOL_TYPE.DIVISION]: {
      NATO: LivePool;
      PACT: LivePool;
      NEUTRAL: LivePool;
    };
  };
  gameSlots: (UserDescriptor | null)[];
  lobbySlots: (UserDescriptor | null)[];

}

export interface WrappedPickBanSession {
  session: PickBanSession;
  code?: string;
}

export enum DIVISION_ALLIANCE {
  NATO = "NATO",
  PACT = "PACT",
}