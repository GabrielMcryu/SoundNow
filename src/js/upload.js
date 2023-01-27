import { initializeApp } from 'firebase/app'
import firebaseConfig from './config.js'

import {
    getAuth, onAuthStateChanged
} from 'firebase/auth'

import {
    getFirestore, collection, getDocs
} from 'firebase/firestore'
import firebaseConfig from './config.js'

initializeApp(firebaseConfig);

const auth = getAuth();



const checkAuthentication = auth.onAuthStateChanged(function(user) {
    if(user) {
        console.log('user logged in')
    } else {
        console.log("use not logged in")
    }
});

checkAuthentication();

console.log("hello world")