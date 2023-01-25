import { initializeApp } from 'firebase/app'

import {
    getAuth, createUserWithEmailAndPassword,
     signInWithEmailAndPassword, onAuthStateChanged
} from 'firebase/auth'

import firebaseConfig from './config.js'

initializeApp(firebaseConfig);

const auth = getAuth();

const registerForm = document.querySelector('#register-form');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = registerForm.email.value;
    const password = registerForm.password.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log('user created: ', cred.user);
            registerForm.reset();
        })
        .catch((err) => {
            console.log(err.message);
        })
})

const user = auth.currentUser;

if (user) {
    console.log(auth.currentUser);
  } else {
    console.log('user is not logged in');
}