import { Router } from "@vaadin/router";
import { notificationService } from "../services/notification";

export function viewDeckCode(deckCode: string, copiedFrom?: string, userDeckId?: string, edit?: boolean) {
  if(deckCode) {

    let searchParams = `?code=${encodeURIComponent(deckCode)}`;


    if(copiedFrom) {
      searchParams += `&cp=${encodeURIComponent(copiedFrom)}`;
    }

    if(userDeckId) {
      searchParams += `&ud=${encodeURIComponent(userDeckId)}`;
    }

    if(edit || copiedFrom) {
      searchParams += `&edit=true`;
    }

    notificationService.instance?.addNotification({
      content: 'Deck code imported',
      duration: 3000,
      theme: '',
    });
    

    Router.go({
      pathname: "/deck-builder",
      search: searchParams
    })
    return;
  }
  throw new Error("No deck code");
}