import { getAuth } from "firebase/auth";
import { Deck } from "../classes/deck";
import { notificationService } from "../services/notification";


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
        creator: getAuth().currentUser?.uid,
        copiedFrom: copiedDeckId,
        public: isPublic,
      };

      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:8090/api/deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(deckRecord),
      });

      if (!response.ok) {
        throw new Error('Error uploading deck');
      }

      notificationService.instance?.addNotification({
        content: 'Deck uploaded successfully',
        theme: 'success',
        duration: 5000,
      });

      const responseData = await response.json();
      return responseData;

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