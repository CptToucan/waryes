import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Deck } from '../classes/deck';


/**
 * Responsible for managing notifications. Rendering is handled by the notification-manager component.
 */
class DeckController implements ReactiveController {

  host: ReactiveControllerHost;
  deck?: Deck;
 

  constructor(host: ReactiveControllerHost) {
   (this.host = host).addController(this);
  }

  initialiseControllerAgainstDeck(deck: Deck) {
    this.deck = deck;
    this.deck?.register(this);
  }

  hostDisconnected() {
    this.deck?.unregister(this);
  }

  triggerRender() {
    this.host.requestUpdate();
  }
  
}

export {DeckController};