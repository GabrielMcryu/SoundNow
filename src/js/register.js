import { initializeApp } from 'firebase/app'

import {
    getAuth, createUserWithEmailAndPassword,
     signInWithEmailAndPassword, onAuthStateChanged
} from 'firebase/auth'

import firebaseConfig from './config.js'

initializeApp(firebaseConfig);

const auth = getAuth();

const navigation = document.querySelector('.main-nav');
const registration = document.querySelector('#registration');

const registerForm = document.querySelector('#register-form');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = registerForm.email.value;
    const password = registerForm.password.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log('user created: ', cred.user);
            registerForm.reset();
            window.location.replace("../../index.html");
        })
        .catch((err) => {
            console.log(err.message);
        })
});

const navUI = function() {
    navigation.innerHTML = '';
    let html = `
        <ul class="main-nav-list">
            <li><a class="main-nav-link" href="src/pages/upload.html">Upload Song</a></li>
            <li><a class="main-nav-link" href="#">Dashboard</a></li>
            <li><a class="main-nav-link" href="src/pages/login.html">Login</a></li>
            <li><a class="main-nav-link" href="src/pages/register.html">Register</a></li>
        </ul>
    `;
    navigation.insertAdjacentHTML('afterbegin', html);
}

const formUI = function() {
    registration.innerHTML = '';
    let html = `
        <div class="form">
            <h2 class="form-header">Register</h2>
            <form action="" id="register-form">
                <label class="form-label">Email:</label>
                <input class="input-field" type="text" name="email">

                <label class="form-label">Password:</label>
                <input class="input-field" type="password" name="password">

                <input class="submit-btn" type="submit" value="Register">
            </form>
        </div>
    `;
    registration.insertAdjacentHTML('afterbegin', html)
}

const checkAuthentication = onAuthStateChanged(auth, (user) => {
    if(user) {
        console.log('user logged in');
        window.location.replace("../../index.html");
    } else {
        console.log("user not logged in");
        navUI();
        formUI();
    }
});

checkAuthentication();