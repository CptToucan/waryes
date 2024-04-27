export interface MenuItem {
  id: number;
  attributes: {
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Display: string;
    Logo: string;
    URL: string;
    Authenticated: boolean | null;
    Image: {
      data?: {
        id: number;
        attributes: {
          url: string;
        };
      }
    }
  };
}

export interface MenuGroup {
  id: number;
  Display: string;
  menu_items: {
    data: MenuItem[];
  };
}

export interface MenuResponse {
  data: {
    id: number;
    attributes: {
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      MenuGroup: MenuGroup[];
    };
  };
  meta: {};
}
