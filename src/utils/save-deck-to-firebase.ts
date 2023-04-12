import { getAuth } from "firebase/auth";
import { addDoc, collection, DocumentReference, Timestamp } from "firebase/firestore";
import { Deck } from "../classes/deck";
import { FirebaseService } from "../services/firebase";
import { notificationService } from "../services/notification";


export async function saveDeckToFirebase(deck: Deck, deckName: string, selectedTags: string[], copiedDeckRef?: DocumentReference) {
  if(selectedTags.length > 5) {
    notificationService.instance?.addNotification({
      content: 'Too many tags',
      theme: 'error',
      duration: 5000,
    });
    return;
  }

  if(selectedTags.length < 1) {
    notificationService.instance?.addNotification({
      content: 'Please select at least one tag',
      theme: 'error',
      duration: 5000,
    });
    return;
  }

  if (deck) {
    try {
      const doc = await addDoc(collection(FirebaseService.db, 'decks'), {
        tags: selectedTags,
        description: '',
        division: deck.division.descriptor,
        country: deck.division.country,
        code: deck.toDeckCode(),
        name: deckName,
        vote_count: 0,
        created: Timestamp.fromDate(new Date()),
        updated: Timestamp.fromDate(new Date()),
        created_by: getAuth().currentUser?.uid,
        copied_from: copiedDeckRef,
      });

      notificationService.instance?.addNotification({
        content: 'Deck uploaded successfully',
        theme: 'success',
        duration: 5000,
      });

      return doc;

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