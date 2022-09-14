import {FirebaseApp, initializeApp} from 'firebase/app';
import { Firestore, initializeFirestore } from 'firebase/firestore';
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: 'AIzaSyAbaxNuNQPWeGj70fil5PJmYJOCeMes6X0',
  authDomain: 'catur-11410.firebaseapp.com',
  databaseURL: 'https://catur-11410.firebaseio.com',
  projectId: 'catur-11410',
  storageBucket: 'catur-11410.appspot.com',
  messagingSenderId: '190186563233',
  appId: '1:190186563233:web:f2d37c452a73424343f2e0',
  measurementId: 'G-N7T189R144',
};

class FirebaseServiceClass {
  constructor() {
    const app = initializeApp(firebaseConfig);
    const db = initializeFirestore(app, {ignoreUndefinedProperties: true});
    const auth = getAuth(app);

  
    this.app = app;
    this.db = db;
    this.auth = auth;
  }

  app?: FirebaseApp;
  db?: Firestore;
  auth?: Auth;
}

const FirebaseService = new FirebaseServiceClass();
export {FirebaseService, FirebaseServiceClass};