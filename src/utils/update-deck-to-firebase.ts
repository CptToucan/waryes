import { doc, Timestamp, updateDoc} from 'firebase/firestore';
import { FirebaseService } from "../services/firebase";
import { notificationService } from '../services/notification';

export async function updateDeckToFirebase(deckId: string, newDeckCode: string) {
  const deckRef = doc(FirebaseService.db, 'decks', deckId);

  const deckUpdate = {
    code: newDeckCode,
    updated: Timestamp.fromDate(new Date()),
  };

  try {
    await updateDoc(deckRef, deckUpdate);
    
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
