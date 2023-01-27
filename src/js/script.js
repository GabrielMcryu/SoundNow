import { dashboardUI, loggedInNavUI, loggedOutNavUI, uploadUI}from './innerHtml.js'

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

const navigation = document.querySelector('#nav');
const sectionTag = document.querySelector('#section');

//////////////////////////////////////////////
// AUTHENTICATION


// UI
const navUI = function(isloggedIn) {
    navigation.innerHTML = '';
    let html;
    let logout;
    let upload;
    if(isloggedIn) {
        html = loggedInNavUI();
        navigation.insertAdjacentHTML('afterbegin', html);

        logout = document.querySelector('.logout');
        logout.addEventListener('click', () => {
            signOut(auth)
                .then(() => {
                    console.log('the user has signed out');
                })
                .catch((err) => {
                    console.log(err.message);
                })
        });

        upload = document.querySelector('#upload');
        upload.addEventListener('click', () => {
            goToUpload(isloggedIn);
        });

    } else {
        html = loggedOutNavUI();
        navigation.insertAdjacentHTML('afterbegin', html);

        upload = document.querySelector('#upload');
        upload.addEventListener('click', () => {
            goToUpload(isloggedIn);
        });
    }
}

const sectionUI = function(sectionName, isLoggedIn) {
    sectionTag.innerHTML = '';
    if (sectionName === "main") {
        let html = dashboardUI();
        sectionTag.insertAdjacentHTML('afterbegin', html);
    } else if(sectionName === "upload") {
        let html = uploadUI();
        sectionTag.insertAdjacentHTML('afterbegin', html);
    } else {
        console.log("hello world");
    }
}

const goToUpload = function(isLoggedIn) {
    if(isLoggedIn) {
        const sectionName = "upload";
        sectionUI(sectionName);
    } else {
        console.log('not logged in');
    }
}

const indexUI = function() {
    onAuthStateChanged(auth, (user) => {
        let isLoggedIn
        const sectionName = "main";
        if(user) {
            isLoggedIn = true;
            navUI(isLoggedIn);
            sectionUI(sectionName, isLoggedIn);
        } else {
            isLoggedIn = false;
            navUI(isLoggedIn);
            sectionUI(sectionName, isLoggedIn);
        }

    });
}

indexUI();
















// init services
const db = getFirestore();

// collection ref
const colRef = collection(db, 'test');

// get collection data
getDocs(colRef)
    .then((snapshot) => {
        console.log(snapshot.docs);
});


const test1 = document.querySelector('.test');

const testUI = function(){
    test1.innerHTML = '';
    const html = `
        <ul>
            <li>food</li>
            <li>dog</li>
            <li>weapon</li>
        </ul>
    `;
    test1.insertAdjacentHTML('afterbegin', html);
}
// testUI();