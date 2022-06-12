import {UrlWatcherCallback} from '../types';

class LocationClass {
  initiated = false;
  callbacks: UrlWatcherCallback[] = [];

  registerCallback(callback: UrlWatcherCallback) {
    if (this.initiated === false) {
      this.setup();
    }

    this.callbacks = [...this.callbacks, callback];
  }

  unregisterCallback(callback: UrlWatcherCallback) {
    if (this.initiated === false) {
      this.setup();
    }

    this.callbacks = [
      ...this.callbacks.filter((el) => {
        el !== callback;
      }),
    ];
  }

  setup() {
    let lastUrl = location.href;
    window.addEventListener('popstate', () => {
      const url = location.href;
      if (url !== lastUrl) {
        for (const callback of this.callbacks) {
          callback(url, lastUrl);
        }
        lastUrl = url;
      }
    });

    /*
    const pushUrl = (href: string) => {
      history.pushState({}, '', href);
      window.dispatchEvent(new Event('popstate'));
    };
    */
    //let lastUrl = location.href;

    /*
    console.log(this.callbacks)
    new MutationObserver(() => {
      const url = location.href;
      console.log(url, lastUrl);
      if (url !== lastUrl) {
        

        for (const callback of this.callbacks) {
          //callback(url, lastUrl);
          console.log(callback);
        }
        lastUrl = url;
      }
    }).observe(document, {subtree: true, childList: true});
    */

    this.initiated = true;
  }
}

const UrlWatcher = new LocationClass();

export {UrlWatcher};
