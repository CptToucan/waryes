import { DeckDatabaseAdapter } from "../classes/DeckDatabaseAdapter";
import { notificationService } from '../services/notification';

export async function updateDeckToDatabase(deckId: number, newDeckCode?: string, isPublic?: boolean) {

  const updateProperties: {
    code?: string,
    public?: boolean,
  } = {};

  if(newDeckCode) {
    updateProperties['code'] = newDeckCode;
  }

  if(isPublic === true || isPublic === false) {
    updateProperties['public'] = isPublic;
  }

  try {
    await DeckDatabaseAdapter.updateDeck(deckId, updateProperties);
    
    notificationService.instance?.addNotification({
      content: 'Deck updated successfully',
      theme: 'success',
      duration: 5000,
    });
  }
  catch (e) {
    console.error('Error updating document: ', e);
    notificationService.instance?.addNotification({
      content: 'Error updating deck',
      theme: 'error',
      duration: 5000,
    });
  }
}
