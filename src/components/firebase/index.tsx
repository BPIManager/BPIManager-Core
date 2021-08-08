import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth'
import "firebase/functions";
const fb = firebase.initializeApp({
  apiKey: "AIzaSyAIlzzxI0kZtIe4vvjSIiRwfqSQVZtbluM",
  authDomain: "bpimv2.firebaseapp.com",
  projectId: "bpimv2",
  storageBucket: "bpimv2.appspot.com",
  messagingSenderId: "199747072203",
  appId: "1:199747072203:web:79b7545a4e426763b5ab4e",
  measurementId: "G-4V5QE3YXF9"
});

export const firestore = fb.firestore();
export const auth = fb.auth();
export const twitter = new firebase.auth.TwitterAuthProvider();
export const google = new firebase.auth.GoogleAuthProvider();
export default fb;

const f = fb.functions("asia-northeast1");

if (window.location.hostname === "localhost") {
  f.useFunctionsEmulator('http://localhost:5001');
  fb.auth().signInWithEmailAndPassword("","");
}

export const functions = f;
