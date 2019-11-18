import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth'

const fb = firebase.initializeApp({
  apiKey: "AIzaSyDSy7KvNgPa42c8aiILI6o7jknMCq72Saw",
  authDomain: "bpim-d5971.firebaseapp.com",
  databaseURL: "https://bpim-d5971.firebaseio.com",
  projectId: "bpim-d5971",
  storageBucket: "bpim-d5971.appspot.com",
  messagingSenderId: "263404475070",
  appId: "1:263404475070:web:74212b489a5cfdb66904ef",
  measurementId: "G-1RBYE73RY5"
});

export const firestore = fb.firestore();
export const auth = fb.auth();
export const twitter = new firebase.auth.TwitterAuthProvider();
export default fb;
