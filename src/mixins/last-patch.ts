import { BundleManagerService } from "../services/bundle-manager";


export function LastPatchMixin<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {

    lastPatchDate?: Date;

    async getLastPatchDate() {
      const lastPatchCreation = BundleManagerService.latestPatch?.createdAt;
      return lastPatchCreation ? new Date(lastPatchCreation) : new Date();
    }

    async fetchLastPatchDate() {
      this.lastPatchDate = await this.getLastPatchDate();
    }
  };
}