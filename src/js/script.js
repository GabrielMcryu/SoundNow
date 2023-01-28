import {
    convertSongName
} from './upload.js'

import { 
    dashboardUI, loggedInNavUI, 
    loggedOutNavUI, uploadUI, 
    loginUI, registerUI
}from './innerHtml.js'

import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection, 
    getDocs, doc, setDoc,
    updateDoc
} from 'firebase/firestore'
import firebaseConfig from './config.js'
import {
    getAuth, signInWithEmailAndPassword, 
    onAuthStateChanged, signOut,
    GoogleAuthProvider, signInWithRedirect,
    createUserWithEmailAndPassword
} from 'firebase/auth'

import {
    getStorage, ref as sRef,
    uploadBytesResumable, getDownloadURL
} from 'firebase/storage'

initializeApp(firebaseConfig);

const auth = getAuth();
const provider = new GoogleAuthProvider();

const db = getFirestore();

const storage = getStorage();

const navigation = document.querySelector('#nav');
const sectionTag = document.querySelector('#section');

//////////////////////////////////////////////
// AUTHENTICATION

const emailSignIn = function(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log("user logged in", cred.user);
            loginForm.reset();
            location.reload();
        })
        .catch((err) => {
            console.log(err.message)
        });
}

const googleSignIn = function() {
    signInWithRedirect(auth, provider);

    getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
    // location.reload();
    console.log(user);
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
}

const registerUser = function(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log('user created: ', cred.user);
            registerForm.reset();
            location.reload();
        })
        .catch((err) => {
            console.log(err.message);
    });
}

///////////////////////////////////////
// UI
const navUI = function(isloggedIn) {
    navigation.innerHTML = '';
    let html;
    let logout;
    let upload;
    let loginLink;
    let registerLink;
    let dashboard;
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
            renderUpload(isloggedIn);
        });

        dashboard = document.querySelector('#dashboard');
        dashboard.addEventListener('click', () => {
            renderIndex();
        });
    } else {
        html = loggedOutNavUI();
        navigation.insertAdjacentHTML('afterbegin', html);

        upload = document.querySelector('#upload');
        upload.addEventListener('click', () => {
            renderUpload(isloggedIn);
        });

        loginLink = document.querySelector('#login');
        loginLink.addEventListener('click', () => {
            renderLogin();
        });

        registerLink = document.querySelector('#register');
        registerLink.addEventListener('click', () => {
            renderRegister();
        });

        dashboard = document.querySelector('#dashboard');
        dashboard.addEventListener('click', () => {
            renderIndex();
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

        const uploadForm = document.querySelector('#upload-form');
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const songName = uploadForm.songName.value;
            const artistName = uploadForm.artistName.value;
            const songImage = uploadForm.songImage.files[0];
            const songAudio = uploadForm.songAudio.files[0];
            UploadToStorage(songName, artistName, songImage, songAudio);
        });

    } else if(sectionName === "login") {
        let html = loginUI();
        sectionTag.insertAdjacentHTML('afterbegin', html);

        const loginForm = document.querySelector('#login-form');
        const googleButton = document.querySelector('#google-sign-in');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            emailSignIn(email, password);
        });
        googleButton.addEventListener('click', (e) => {
            googleSignIn();
        })
    } else if(sectionName === "register") {
        let html = registerUI()
        sectionTag.insertAdjacentHTML('afterbegin', html);

        const registerForm = document.querySelector('#register-form');
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            registerUser(email, password);
        });
    } else {
        console.log("hello world");
    }
}

const renderUpload = function(isLoggedIn) {
    if(isLoggedIn) {
        const sectionName = "upload";
        sectionUI(sectionName);
    } else {
        renderLogin();
    }
}

const renderLogin = function() {
    const sectionName = "login";
    sectionUI(sectionName);
}

const renderRegister = function() {
    const sectionName = "register";
    sectionUI(sectionName);
}

////////////////////////////////////////////
// UPLOAD TRACK TO FIREBASE

async function UploadToStorage(songName, artistName, songImage, songAudio) {
    const songPath = convertSongName(songName);
    const imgName = songImage.name;
    const audioName = songAudio.name;

    const audioMetaData = {
        contentType: songAudio.type
    }

    const imageMetaData = {
        contentType: songImage.type
    }

    const imageStorageRef = sRef(storage, 'Images/' + imgName);
    const audioStorageRef = sRef(storage, 'Tracks/' + audioName);

    const imageUploadTask = uploadBytesResumable(imageStorageRef, songImage, imageMetaData);
    const audioUploadTask = uploadBytesResumable(audioStorageRef, songAudio, audioMetaData);

    imageUploadTask.on('state-changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred /snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
    },
    (error) => {
        alert("error: image not uploaded");
    },
    () => {
        getDownloadURL(imageUploadTask.snapshot.ref).then((downloadURL) => {
            SaveToFirestore(downloadURL, songName, artistName, songPath)
        })
    }
    );

    audioUploadTask.on('state-changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred /snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
    },
    (error) => {
        alert("error: audio not uploaded");
    },
    () => {
        getDownloadURL(audioUploadTask.snapshot.ref).then((downloadURL) => {
            SaveAudioToFirestore(downloadURL, songPath);
        })
    }
    );
    
}   

async function SaveToFirestore(imgUrl, songName, artistName, songPath) {
    const songRef = doc(db, 'tracks', songPath);
    await setDoc(songRef, {
        SongName: songName,
        ArtistName: artistName,
        ImageUrl: imgUrl
    }, { merge: true });

    console.log('image upload finished');
}

async function SaveAudioToFirestore(songUrl, songPath) {
    const songRef = doc(db, "tracks", songPath);
    await updateDoc(songRef, {
        SongUrl: songUrl
    }, { merge: true });

    console.log('audio upload finished');
}



const renderIndex = function() {
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

renderIndex();




















// collection ref
const colRef = collection(db, 'test');

// get collection data
getDocs(colRef)
    .then((snapshot) => {
        console.log(snapshot.docs);
});


