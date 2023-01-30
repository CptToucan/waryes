import { categoryNames } from "./get-code-for-factory-descriptor";

export function deckCategoryIsDeprecated(descriptor: string): boolean {

  if(categoryNames[descriptor] === undefined) {
    return true;
  }
  return false;
}