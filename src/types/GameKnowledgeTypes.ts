export interface GameKnowledgeResponse {
  data: GameKnowledge[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SingleGameKnowledgeResponse {
  data: GameKnowledge;
  meta: {}
}

export interface GameKnowledge {
  id: number;
  attributes: {
    Title: string;
    Content: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    slug: string;
    related_game_knowledges: {
      data: GameKnowledge[];
    };
  };
}

export interface GameKnowledgePageResponse {
  data: GameKnowledgePage;
  meta: {}
}

export interface GameKnowledgePage {
  id: number;
  attributes: {
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    GameKnowledgeGroup: GameKnowledgeGroup[];
  };
}

export interface GameKnowledgeGroup {
  id: number;
  Title: string;
  game_knowledges: {
    data: GameKnowledge[];
  };
}