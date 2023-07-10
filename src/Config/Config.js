import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAKo3J4Sp8qMYpkhbWTSDQpbyf6jJbK7Ww",
  authDomain: "for-testing-2baf5.firebaseapp.com",
  databaseURL: "https://for-testing-2baf5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "for-testing-2baf5",
  storageBucket: "for-testing-2baf5.appspot.com",
  messagingSenderId: "652138421847",
  appId: "1:652138421847:web:dd798d1095346df020cd12",
  measurementId: "G-Z6B0Q153KL"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();


export default firebase;
