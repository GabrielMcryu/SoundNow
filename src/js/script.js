import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection, getDocs
} from 'firebase/firestore'
import firebaseConfig from './config.js'

import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from 'firebase/auth'

initializeApp(firebaseConfig);

const auth = getAuth();

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


const checkAuthentication = auth.onAuthStateChanged(function(user) {
    if(user) {
        console.log('user is logged in');
        console.log(user.email);
    } else {
        console.log('user is not logged in');
    }
});

checkAuthentication();

const logout = document.querySelector('.logout');
logout.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('the user has signed out');
        })
        .catch*((err) => {
            console.log(err.message);
        })
})