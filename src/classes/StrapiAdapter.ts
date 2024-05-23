import { DivisionAnalysisResponse } from "../types/DivisionAnalysisTypes";
import { GameKnowledgePageResponse, GameKnowledgeResponse, SingleGameKnowledgeResponse } from "../types/GameKnowledgeTypes";
import { MenuResponse } from "../types/HomepageMenuTypes";
import { HomepageResponse } from "../types/HomepageTypes";
import { TooltipResponse } from "../types/TooltipTypes";
import qs from "qs";
export class StrapiAdapter {
  static baseUrl = process.env.STRAPI_URL;
  static apiUrl: string = `${StrapiAdapter.baseUrl}/api`;

  static async getDivisionAnalysis(): Promise<DivisionAnalysisResponse | null> {
    try {
      const response = await fetch(StrapiAdapter.getDivisionAnalysisUrl());
      if (!response.ok) {
        throw new Error('Failed to fetch division analysis');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch division analysis');
    }
  }

  static getDivisionAnalysisUrl() {
    const queryParams = qs.stringify({
      populate: {
        "UnitDescriptors": {
          populate: {
            "UnitWithDescription": {
              fields: ["UnitId", "UnitDescription"]
            }
          }
        },
        "Pros": {
          populate: {
            fields: ["BulletPoint"]
          }
        },
        "Cons": {
          populate: {
            fields: ["BulletPoint"]
          }
        }
      },
      pagination: {
        pageSize: 50,
        page: 1
      }
    });
    return `${StrapiAdapter.apiUrl}/division-analyses?${queryParams}`;
  }

  static async getHomePage(): Promise<HomepageResponse | null> {
    try {
      const response = await fetch(StrapiAdapter.getHomePageUrl());
      if (!response.ok) {
        throw new Error('Failed to fetch home page');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch home page');
    }
  }

  static getHomePageUrl() {
    return `${StrapiAdapter.apiUrl}/homepage?populate=*`;
  }


  static async getHomePageMenu(): Promise<MenuResponse | null> {
    try {
      const response = await fetch(StrapiAdapter.getHomePageMenuUrl());
      if (!response.ok) {
        throw new Error('Failed to fetch home page menu');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch home page menu');
    }
  }

  static getHomePageMenuUrl() {
    const queryParams = qs.stringify({
      populate: {
        "MenuGroup": {
          populate: {
            "menu_items": {
              fields: ["Display", "Logo", "URL", "Image", "Authenticated"],
              populate: {
                "Image": {
                  fields: ["url"]
                }
              }
            }
          },
          fields: ["Display"]
        }
      }
    });
    return `${StrapiAdapter.apiUrl}/homepage-menu?${queryParams}`;
  }

  static async getSideMenu(): Promise<MenuResponse | null> {
    try {
      const response = await fetch(StrapiAdapter.getSideMenuUrl());
      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch menu');
    }
  }

  static getSideMenuUrl() {
    const queryParams = qs.stringify({
      populate: {
        "MenuGroup": {
          populate: {
            "menu_items": {
              populate: {
                "Item": {
                  fields: ["Display", "Logo", "URL", "Image", "Authenticated"]
                }
              }
            }
          },
          fields: ["Display"]
        }
      }
    });
    return `${StrapiAdapter.apiUrl}/side-menu?${queryParams}`;
  }

  static async getGameKnowledges(page: number, pageSize: number): Promise<GameKnowledgeResponse | null>{
    try {
      const response = await fetch(StrapiAdapter.getGameKnowledgesUrl(page, pageSize));
      if (!response.ok) {
        throw new Error('Failed to fetch game guides');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch game guides');
    }
  }

  static async getSingleGameKnowledge(slug: string): Promise<SingleGameKnowledgeResponse | null> {
    try {
      const response = await fetch(StrapiAdapter.getSingleGameKnowledgeUrl(slug));
      if (!response.ok) {
        throw new Error('Failed to fetch game guide');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch game guide');
    }
  }

  static async getGameKnowledgePage(): Promise<GameKnowledgePageResponse | null> {
    try {
      const response = await fetch(StrapiAdapter.getGameKnowledgePageUrl());
      if (!response.ok) {
        throw new Error('Failed to fetch game knowledge page');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch game knowledge page');
    }

  }

  static getGameKnowledgePageUrl() {
    const queryParams = qs.stringify({
      populate: {
        GameKnowledgeGroup: {
          fields: ["Title"],
          populate: {
            game_knowledges: {
              fields: ["Title", "slug"]
            }
          }
        }
      }
    });
    return `${StrapiAdapter.apiUrl}/game-knowledge-page?${queryParams}`;
  }

  static getBaseGameKnowledgeUrl() {
    return `${StrapiAdapter.apiUrl}/game-knowledges`;
  }

  static getSingleGameKnowledgeUrl(slug: string) {

    
    const queryParams = qs.stringify({
      populate: {
        related_game_knowledges: {
          fields: ['Title', 'slug']
        }
      }
    });
    
    return `${StrapiAdapter.getBaseGameKnowledgeUrl()}/${slug}?${queryParams}`;
  }

  static getGameKnowledgesUrl(page: number, pageSize: number) {
    return `${StrapiAdapter.getBaseGameKnowledgeUrl()}?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
  }

  static async getTooltip(slug: string): Promise<TooltipResponse | null> {
    try {
      const response = await fetch(StrapiAdapter.getTooltipUrl(slug));
      if (!response.ok) {
        throw new Error('Failed to fetch tooltip');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch tooltip');
    }
  }

  static getTooltipUrl(slug: string) {
    return `${StrapiAdapter.apiUrl}/tooltips/${slug}`;
  }

  static async getPickBanConfigs(): Promise<any> {
    try {
      const response = await fetch(StrapiAdapter.getPickBanConfigsUrl());
      if (!response.ok) {
        throw new Error('Failed to fetch pick ban configs');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch pick ban configs');
    }
  }

  static getPickBanConfigsUrl() {
    return `${StrapiAdapter.apiUrl}/pick-ban-configs`;
  }

}


// http://localhost:1337/api/game-knowledge-page?populate[GameKnowledgeGroup][fields][0]=Title&populate[GameKnowledgeGroup][populate][game_knowledges][fields][0]=Title&populate[GameKnowledgeGroup][populate][game_knowledges][fields][1]=slug&populate[GameKnowledgeGroup][populate][game_knowledges][populate][game_knowledges][fields][0]=Title&populate[GameKnowledgeGroup][populate][game_knowledges][populate][game_knowledges][fields][1]=slug