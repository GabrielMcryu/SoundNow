import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection, getDocs
} from 'firebase/firestore'
import firebaseConfig from './config.js'

initializeApp(firebaseConfig);

console.log("hello world");

// init services
const db = getFirestore();

// collection ref
const colRef = collection(db, 'test');

// get collection data
getDocs(colRef)
    .then((snapshot) => {
        console.log(snapshot.docs);
    });