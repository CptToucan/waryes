import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Deck } from '../classes/deck';
import { Pack, UnitCategory } from '../types/deck-builder';


/**
 * Responsible for managing notifications. Rendering is handled by the notification-manager component.
 */
class DeckController implements ReactiveController {

  host: ReactiveControllerHost;
  deck?: Deck;
  
  linkedProperty?: (Pack | UnitCategory);

  constructor(host: ReactiveControllerHost) {
   (this.host = host).addController(this);
  }

  initialiseControllerAgainstDeck(deck: Deck, linkedProperty: (Pack | UnitCategory)) {
    this.deck = deck;
    this.deck?.register(this, linkedProperty);
  }

  hostDisconnected() {
    if(this.linkedProperty) {
      this.deck?.unregister(this, this.linkedProperty as (Pack | UnitCategory));
    }
  }

  triggerRender() {
    this.host.requestUpdate();
  }
  
}

export {DeckController};