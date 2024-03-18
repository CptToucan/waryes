import { Deck } from "../classes/deck";
import { notificationService } from "../services/notification";
import { DeckDatabaseAdapter } from "../classes/DeckDatabaseAdapter";


export async function saveDeckToDatabase(deck: Deck, deckName: string, selectedTags: string[], copiedDeckId?: number, isPublic?: boolean) {
  if(selectedTags.length > 5) {
    notificationService.instance?.addNotification({
      content: 'Too many tags',
      theme: 'error',
      duration: 5000,
    });

    throw new Error('Too many tags');
  }

  if(selectedTags.length < 1) {
    notificationService.instance?.addNotification({
      content: 'Please select at least one tag',
      theme: 'error',
      duration: 5000,
    });
    
    throw new Error('Please select at least one tag');
  }

  if (deck) {
    try {
      const deckRecord = {
        tags: selectedTags.toString(),
        division: deck.division.descriptor,
        code: deck.toDeckCode(),
        name: deckName,
        copiedFrom: copiedDeckId || 0,
        public: isPublic || false,
      };

      
      const response = await DeckDatabaseAdapter.createDeck(deckRecord);

      notificationService.instance?.addNotification({
        content: 'Deck uploaded successfully',
        theme: 'success',
        duration: 5000,
      });

      return response;

    } catch (e) {
      console.error('Error adding document: ', e);
      notificationService.instance?.addNotification({
        content: 'Error uploading deck',
        theme: 'error',
        duration: 5000,
      });

      throw new Error('Error uploading deck');
    }
  } else {
    throw new Error('No deck to upload');
  }
}