import { doc, Timestamp, updateDoc} from 'firebase/firestore';
import { FirebaseService } from "../services/firebase";
import { notificationService } from '../services/notification';

export async function updateDeckToFirebase(deckId: string, newDeckCode?: string, isPublic?: boolean) {
  const deckRef = doc(FirebaseService.db, 'decks', deckId);

  const updateProperties: {
    updated: Timestamp,
    code?: string,
    public?: boolean,
  } = {
    updated: Timestamp.fromDate(new Date()),
  }

  if(newDeckCode) {
    updateProperties['code'] = newDeckCode;
  }

  if(isPublic === true || isPublic === false) {
    updateProperties['public'] = isPublic;
  }


  try {
    await updateDoc(deckRef, updateProperties);
    
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
