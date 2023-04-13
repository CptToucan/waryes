import { Deck } from "../classes/deck";
import { notificationService } from "../services/notification";

export async function exportDeckToCode(deck?: Deck) {
  try {
    if (deck) {
      const deckCode = deck.toDeckCode();
      await navigator.clipboard.writeText(deckCode);
      notificationService.instance?.addNotification({
        content: 'Deck code copied to clipboard',
        duration: 3000,
        theme: '',
      });
      return;
    } else {
      throw new Error('No deck to export');
    }
  } catch (err) {
    notificationService.instance?.addNotification({
      content: 'Failed to generate deck code',
      duration: 5000,
      theme: 'error',
    });
    console.error(err);
  }
}