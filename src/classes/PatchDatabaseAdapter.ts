export interface PatchRecord {
  name: string;
  createdAt: string;
}

export interface PatchCollectionApiResponse {
  data: PatchRecord[];
  meta: {};
}

export interface PatchGetApiResponse {
  data: PatchRecord;
  meta: {};
}

export class PatchDatabaseAdapter {
  static apiUrl: string = `${process.env.API_URL}`;
  static staticUrl: string = `${process.env.STATIC_URL}`;

  static async findOne(name: string): Promise<PatchRecord | null> {
    try {
      const response = await fetch(`${PatchDatabaseAdapter.apiUrl}/patch/${name}`);
      if (!response.ok) {
        throw new Error('Patch not found');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  static async latest(): Promise<PatchRecord | null> {
    try {
      const response = await fetch(`${PatchDatabaseAdapter.apiUrl}/patch/latest`);
      if (!response.ok) {
        throw new Error('Patch not found');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  static async findAll(): Promise<PatchRecord[]> {
    try {
      const response = await fetch(`${PatchDatabaseAdapter.apiUrl}/patch`);
      if (!response.ok) {
        throw new Error('Internal server error');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  static async fetchPatchFile(patchName: string) {
    const response = await fetch(`${PatchDatabaseAdapter.staticUrl}/${patchName}/patch.json`);
    if (!response.ok) {
      throw new Error('Patch file not found');
    }
    return response.json();
  }
}

