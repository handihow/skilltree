import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/functions";
import "firebase/analytics";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_SKILLTREE_FIREBASE_CONFIG_APIKEY,
  authDomain: process.env.REACT_APP_SKILLTREE_FIREBASE_CONFIG_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_SKILLTREE_FIREBASE_CONFIG_DATABASEURL,
  projectId: process.env.REACT_APP_SKILLTREE_FIREBASE_CONFIG_PROJECTID,
  storageBucket: process.env.REACT_APP_SKILLTREE_FIREBASE_CONFIG_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_SKILLTREE_FIREBASE_CONFIG_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_SKILLTREE_FIREBASE_CONFIG_APPID,
  measurementId: process.env.REACT_APP_SKILLTREE_FIREBASE_CONFIG_MEASUREMENTID,
};
export const myFirebase = firebase.initializeApp(firebaseConfig);

myFirebase.analytics();
const baseDb = myFirebase.firestore();
export const db = baseDb;
const fbStorage = myFirebase.storage();
export const storage = fbStorage;
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const microsoftProvider = new firebase.auth.OAuthProvider(
  "microsoft.com"
);
export const googleFontAPIKey = process.env.REACT_APP_SKILLTREE_GOOGLEFONTAPIKEY;
export const youtubeAPIKey = process.env.REACT_APP_SKILLTREE_YOUTUBEAPIKEY;
const fbFunctions = myFirebase.functions();
export const functions = fbFunctions;

