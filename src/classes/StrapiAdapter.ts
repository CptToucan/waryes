import { DivisionAnalysisResponse } from "../types/DivisionAnalysisTypes";
import { MenuResponse } from "../types/HomepageMenuTypes";
import { HomepageResponse } from "../types/HomepageTypes";

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
    return `${StrapiAdapter.apiUrl}/division-analyses?populate[UnitDescriptors][populate][UnitWithDescription][fields][0]=UnitId&populate[UnitDescriptors][populate][UnitWithDescription][fields][1]=UnitDescription&populate[Pros][populate][fields][0]=BulletPoint&populate[Cons][populate][fields][0]=BulletPoint&pagination[pageSize]=50&pagination[page]=1`;
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
    return `${StrapiAdapter.apiUrl}/homepage-menu?populate[MenuGroup][populate][menu_items][fields][0]=Display&populate[MenuGroup][populate][menu_items][fields][1]=Logo&populate[MenuGroup][populate][menu_items][fields][2]=URL&populate[MenuGroup][populate][menu_items][fields][3]=Image&populate[MenuGroup][populate][menu_items][populate][Image][fields][0]=url&populate[MenuGroup][populate][menu_items][fields][4]=Authenticated&populate[MenuGroup][fields][0]=Display`;
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
    return `${StrapiAdapter.apiUrl}/side-menu?populate[MenuGroup][populate][menu_items][populate][Item][fields][0]=Display&populate[MenuGroup][populate][menu_items][populate][Item][fields][1]=Logo&populate[MenuGroup][populate][menu_items][populate][Item][fields][2]=URL&populate[MenuGroup][populate][menu_items][populate][Item][fields][3]=Image&populate[MenuGroup][populate][menu_items][populate][Item][fields][4]=Authenticated&populate[MenuGroup][fields][0]=Display`;
  }
}
