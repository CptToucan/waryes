import { Router } from "@vaadin/router";

export function viewDeckCode(deckCode: string) {
  if(deckCode) {
    Router.go({
      pathname: "/deck-builder",
      search: `?code=${encodeURIComponent(deckCode)}`
    })
    return;
  }
  throw new Error("No deck code");
}