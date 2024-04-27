

export interface DivisionAnalysisPage {
  divisions: DivisionAnalysisDivision[];
}


export interface DivisionAnalysisDivision {
  id: number;
  attributes: DivisionAnalysisAttributes;
}

export interface DivisionAnalysisAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  DivisionDescription: string;
  DivisionDescriptor: string;
  DivisionHistory: string | null;
  Pros: DivisionAnalysisPros[];
  Cons: DivisionAnalysisCons[];
  UnitDescriptors: DivisionAnalysisUnitDescriptors[];
}

export interface DivisionAnalysisPros {
  id: number;
  Bulletpoint: string;
}

export interface DivisionAnalysisCons {
  id: number;
  Bulletpoint: string;
}

export interface DivisionAnalysisUnitDescriptors {
  id: number;
  DescriptorId: string
}

export interface DivisionAnalysisResponse {
  data: DivisionAnalysisDivision[];
  meta: DivisionAnalysisMeta;
}

export interface DivisionAnalysisMeta {
  pagination: DivisionAnalysisPagination;
}

export interface DivisionAnalysisPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}