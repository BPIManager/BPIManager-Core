import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth'
import "firebase/functions";
import { config } from '@/config';
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
const isLocal = ()=> false; //window.location.hostname === "localhost";

if (isLocal()) {
  const uid = "";
  f.useFunctionsEmulator('http://localhost:5001');
  auth.useEmulator('http://localhost:9099');
  fb.auth().signInWithEmailAndPassword("","");
  firestore.collection("users").doc(uid).update({});
}

export const functions = f;

export const httpsCallable = (_cat:string,endpoint:string,data:any)=>{
  if(isLocal()){
    return functions.httpsCallable(`${_cat}/${config.cfVersion}/${endpoint}`)(data);
  }
  return functions.httpsCallable(endpoint)(data);
}

export const httpsCfGet = async(endpoint:string,query?:string)=>{
  const q = query ? "?" + query : "";
  return (await fetch(`https://asia-northeast1-bpimv2.cloudfunctions.net/${endpoint}${q}`)).json().then(t=>{
    return t;
  }).catch(e=>{
    console.log(e);
    return null;
  });
}
