import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/functions";
import "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDl9VV59P2M9kGx2257t6qL6y3OyeVTvVg",
    authDomain: "skilltree-b6bba.firebaseapp.com",
    databaseURL: "https://skilltree-b6bba.firebaseio.com",
    projectId: "skilltree-b6bba",
    storageBucket: "skilltree-b6bba.appspot.com",
    messagingSenderId: "469293733296",
    appId: "1:469293733296:web:534527ba7b4d92585d7275",
    measurementId: "G-B4S062TGSB"
  };
  export const myFirebase = firebase.initializeApp(firebaseConfig);
  myFirebase.analytics();
  const baseDb = myFirebase.firestore();
  export const db = baseDb;
  const fbStorage = myFirebase.storage();
  export const storage = fbStorage;
  export const googleProvider = new firebase.auth.GoogleAuthProvider();
  export const microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');
  export const googleFontAPIKey = 'AIzaSyCmkWh3o81RqMAHzSUmfQqmvB4xGLfvmgE';
  export const youtubeAPIKey = 'AIzaSyDl9VV59P2M9kGx2257t6qL6y3OyeVTvVg'
  const fbFunctions = myFirebase.functions(); 
  export const functions = fbFunctions;