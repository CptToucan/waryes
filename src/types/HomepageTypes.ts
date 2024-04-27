import { ImageAttributes } from "./ImagesTypes";

export interface Attributes {
  Link: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Logo: {
    data: {
      id: number;
      attributes: ImageAttributes;
    };
  };
}

export interface Data {
  id: number;
  attributes: Attributes;
}

export interface HomepageResponse {
  data: Data;
  meta: {};
}
