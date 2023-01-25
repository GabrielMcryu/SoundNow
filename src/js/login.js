import { initializeApp } from 'firebase/app'

import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged
} from 'firebase/auth'

import firebaseConfig from './config.js'

initializeApp(firebaseConfig);

const auth = getAuth();

const loginForm  = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log("user logged in", cred.user);
            loginForm.reset();
            window.location.replace("../../index.html");
        })
        .catch((err) => {
            console.log(err.message)
        });
});
