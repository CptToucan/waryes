export interface TooltipResponse {
  data: Tooltip;
  meta: {};
}

export interface Tooltip {
  id: number;
  attributes: {
    Name: string;
    Description: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    slug: string;
  };
}