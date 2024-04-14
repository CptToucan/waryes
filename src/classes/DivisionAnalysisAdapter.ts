

export interface DivisionAnalysisPage {
  divisions: DivisionAnalysisDivision[];
}





export class DivisionAnalysisAdapter {
  static apiUrl: string = `${process.env.API_URL}`;

  static async getPage(): Promise<DivisionAnalysisResponse | null> {
    try {

      // http://localhost:1337/api/division-analyses?populate=Pros,Cons,UnitDescriptors
      const response = await fetch(`${DivisionAnalysisAdapter.apiUrl}/division-analysis`);
      if (!response.ok) {
        throw new Error('DivisionAnalysis not found');
      }

      return await response.json() as DivisionAnalysisResponse;
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }


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