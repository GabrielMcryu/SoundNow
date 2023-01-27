import { initializeApp } from 'firebase/app'

import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, 
    GoogleAuthProvider, signInWithRedirect, getRedirectResult
} from 'firebase/auth'

import firebaseConfig from './config.js'

initializeApp(firebaseConfig);

const auth = getAuth();
const provider = new GoogleAuthProvider();

const navigation = document.querySelector('.main-nav');

const googleSignInButton = document.querySelector('#google-sign-in');

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

const checkAuthentication = onAuthStateChanged(auth, (user) => {
    if(user) {
        console.log('user logged in');
    } else {
        console.log("user not logged in");
    }
});

checkAuthentication();

googleSignInButton.addEventListener('click', (e) => {
    signInWithRedirect(auth, provider);

    getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
});