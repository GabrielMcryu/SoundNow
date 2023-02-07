import {
    convertSongName
} from './upload.js'

import { 
    loggedInNavUI, loggedOutNavUI, uploadUI, 
    loginUI, registerUI, trackUI, searchUI,
    addCommentUI, commentsUI
}from './innerHtml.js'

import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection, 
    getDocs, doc, setDoc, addDoc,
    updateDoc, getDoc, query, onSnapshot, 
    serverTimestamp, orderBy
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

let track = document.createElement("audio");
let play;
let timer;
let slider;
let VolIconDiv;
let volumeIcon;
let volumeSlider;
let trackCurrentTime;
let trackDuration;
let songIsPlaying = false;

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
                    renderIndex();
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

const sectionUI = function(sectionName, trackData = null, commentsData = null) {
    sectionTag.innerHTML = '';
    if (sectionName === "main") {
        getTracksFromFirestore();
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
    } else if(sectionName === "track") {
        // Comments UI
        commentsData.forEach(function (commentData) {
            let name = commentData.Name;
            let comment = commentData.Comment;
            let commentDate = commentData.createdAt.toDate().toDateString();
            let html = commentsUI(name, comment, commentDate);
            sectionTag.insertAdjacentHTML('afterbegin', html);
        });

        let html = addCommentUI();
        sectionTag.insertAdjacentHTML('afterbegin', html);

        // Comments Form UI
        let songName = trackData.SongName;
        addCommentForm = document.querySelector('#upload-comment');
        addCommentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = addCommentForm.name.value;
            const comment = addCommentForm.comment.value;
            addCommentToFirestore(name, comment, songName);
            addCommentForm.reset();
        });

        // Track UI
        html = trackUI(trackData);
        sectionTag.insertAdjacentHTML('afterbegin', html);

        const songUrl = trackData.SongUrl;

        play = document.querySelector('#play');
        trackCurrentTime = document.querySelector('.current-time');
        trackDuration = document.querySelector('.duration-time');
        slider = document.querySelector('.duration-slider');

        VolIconDiv = document.querySelector('#track-vol-div');
        volumeSlider = document.querySelector('#track-volume-slider');
        volumeIcon = document.querySelector('#volume-icon');

        // all track event listeners
        play.addEventListener("click", justPlay);
        VolIconDiv.addEventListener("click", muteSound);
        volumeSlider.addEventListener("change", changeVolume);
        slider.addEventListener("change", changeDuration);
        track.addEventListener('timeupdate', songTimeUpdate);
        loadTrack(songUrl);

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

const renderTrack = function(trackData, comments) {
    const sectionName = "track";
    sectionUI(sectionName, trackData, comments);
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

///////////////////////////////////////////
// GET TRACKS FROM FIRESTORE

const getTracksFromFirestore = function() {
    const q = query(collection(db, "tracks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        let tracks = [];
        snapshot.forEach((doc) => {
            tracks.push(doc.data());
        });
        renderMain(tracks);
    });
}

const getTrackBySongName = function(songName) {
    const q = query(collection(db, "tracks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        let tracks = [];
        snapshot.forEach((doc) => {
            if(doc.data().SongName.toLowerCase().includes(songName)) {
                tracks.push(doc.data());
            }
        });
        if(tracks.length < 1) {
            const errorMessage = '<p>No such Track Name found.</p>';
            renderNullSearch(errorMessage);
        } else {
            renderMain(tracks)
        }
    })
}

const getTrackByArtistName = function(artistName) {
    const q = query(collection(db, "tracks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        let tracks = [];
        snapshot.forEach((doc) => {
            if(doc.data().ArtistName.toLowerCase().includes(artistName)) {
                tracks.push(doc.data());
            }
        });
        if(tracks.length < 1) {
            const errorMessage = '<p>No such Artist Name found.</p>';
            renderNullSearch(errorMessage);
        } else {
            renderMain(tracks)
        }
    })
}

async function getTrackFromFirestore(trackPath) {
    const docRef = doc(db, "tracks", trackPath);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const trackData = docSnap.data();
        getCommentsFromFirestore(trackData);
        
    } else {
        console.log("No such document!");
    }
}

///////////////////////////////////////////
// GET AND ADD COMMENTS TO FIRESTORE
const addCommentToFirestore = function(name, comment, songName) {
        const songRef = collection(db, 'comments');
        addDoc(songRef, {
            Name: name,
            Comment: comment,
            SongName: songName,
            createdAt: serverTimestamp()
        }).then(() => {
            console.log('comment added');
        });
}

const getCommentsFromFirestore = function(trackData) {
    const colRef = collection(db, 'comments');
    const q = query(colRef, orderBy('createdAt'));
    const songName = trackData.SongName;
    const unsubscribe = onSnapshot(q, (snapshot) => {
        let comments = [];
        snapshot.forEach((doc) => {
            if(doc.data().SongName === songName) {
                comments.push(doc.data());
            }
        });
        renderTrack(trackData, comments);
    });
}


const renderMain = function(tracks) {
    sectionTag.innerHTML = '';
    tracks.forEach(function (track) {
        let html = `
        <div class="container-track track">
            <div class="track-details">
                <img class="track-image" id="track-image" src="${track.ImageUrl}" alt="">
                <div class="track-description">
                    <h2>${track.SongName}</h2>
                    <p>${track.ArtistName}</p>
                </div>
                <div class="track-choice">
                    <button class="btn-track-choice" id="btn-choice" value="${track.SongName}">Play</button>
                </div>
            </div>
        </div>
        `;
        sectionTag.insertAdjacentHTML('afterbegin', html);
        const btnChoice = document.querySelector('#btn-choice');
        btnChoice.addEventListener('click', (e) => {
            const trackName = btnChoice.value;
            const trackPath = convertSongName(trackName);
            getTrackFromFirestore(trackPath);
        });
    });

    let html = searchUI();
    sectionTag.insertAdjacentHTML('afterbegin', html);

    const btnSearch = document.querySelector('#search-btn');
    const searchField = document.querySelector('#search-input');
    const searchChoices = document.querySelector('#search-choice');

    btnSearch.addEventListener('click', (e) => {
        e.preventDefault();  
        if(searchChoices.value === 'all') {
            renderIndex();
        } else if(searchField.value.trim() === '') {
            renderIndex();
        } else if(searchChoices.value === 'artist') {
            getTrackByArtistName(searchField.value.trim().toLowerCase());
        } else if(searchChoices.value === 'track-name') {
            getTrackBySongName(searchField.value.trim().toLowerCase());
        }
    });
    
}

const renderNullSearch = function(errorMessage) {
    sectionTag.innerHTML = '';
    sectionTag.insertAdjacentHTML('afterbegin', errorMessage);

    let html = searchUI();
    sectionTag.insertAdjacentHTML('afterbegin', html);

    const btnSearch = document.querySelector('#search-btn');
    const searchField = document.querySelector('#search-input');
    const searchChoices = document.querySelector('#search-choice');

    btnSearch.addEventListener('click', (e) => {
        e.preventDefault();  
        if(searchChoices.value === 'all') {
            renderIndex();
        } else if(searchField.value.trim() === '') {
            renderIndex();
        } else if(searchChoices.value === 'artist') {
            getTrackByArtistName(searchField.value.trim().toLowerCase());
        } else if(searchChoices.value === 'track-name') {
            getTrackBySongName(searchField.value.trim().toLowerCase());
        }
    });
}

/////////////////////////////////////
// PLAY OPTIONS

const loadTrack = function(songUrl) {
    clearInterval(timer);
    resetSlider();
    track.src = songUrl;

    track.load();

    timer = setInterval(updateSlider, 1000);
}

// Play song or Pause song
function justPlay() {
    if (songIsPlaying == false) {
        playSong();
    } else {
        pauseSong();
    }
}

// Reset Slider
function resetSlider() {
    slider.value = 0;
}

// Play Song
function playSong() {
    track.play();
    songIsPlaying = true;
    play.innerHTML = '<i class="fas fa-pause"></i>'
}

// Pause Song
function pauseSong() {
    track.pause();
    songIsPlaying = false;
    play.innerHTML = '<i class="fas fa-play"></i>'
}

// Mute Sound
function muteSound() {
    VolIconDiv.innerHTML = "<i class='fas fa-volume-mute' id='volume-icon'></i>";
    track.volume = 0;
    volumeSlider.value = 0;
}

// Change Volume
function changeVolume() {
    track.volume = volumeSlider.value / 100;
    if (volumeSlider.value < 1) {
        VolIconDiv.innerHTML = "<i class='fas fa-volume-mute' id='volume-icon'></i>";
    } else {
        VolIconDiv.innerHTML = "<i class='fas fa-volume-up' id='volume-icon'></i>"
    }
}

// Change Duration
function changeDuration() {
    let sliderPosition = track.duration * (slider.value / 100);
    track.currentTime = sliderPosition;
}

// Update Slider
function updateSlider() {
    let position = 0;

    if(!isNaN(track.duration)) {
        position = track.currentTime * (100 / track.duration);
        slider.value = position;
    }

    if (track.ended) {
        play.innerHTML = '<i class="fas fa-play"></i>';
        loadTrack(track.src);
    }
}

// Update Current song time
function songTimeUpdate() {
    if (track.duration) {
        let curmins = Math.floor(track.currentTime / 60);
        let cursecs = Math.floor(track.currentTime - curmins * 60);
        let durmins = Math.floor(track.duration / 60);
        let dursecs = Math.floor(track.duration - durmins * 60);
    
        if (dursecs < 10) {
            dursecs = "0" + dursecs;
        }
        if (durmins < 10) {
            durmins = "0" + durmins;
        }
        if (curmins < 10) {
            curmins = "0" + curmins;
        }
        if (cursecs < 10) {
            cursecs = "0" + cursecs;
        }
        trackCurrentTime.innerHTML = curmins + ":" + cursecs;
        trackDuration.innerHTML = durmins + ":" + dursecs;
       
    } else {
        trackCurrentTime.innerHTML = "00" + ":" + "00";
        trackDuration.innerHTML = "00" + ":" + "00";
    }
}


// load main page
const renderIndex = function() {
    onAuthStateChanged(auth, (user) => {
        let isLoggedIn
        const sectionName = "main";
        if(user) {
            isLoggedIn = true;
            navUI(isLoggedIn);
            sectionUI(sectionName);
        } else {
            isLoggedIn = false;
            navUI(isLoggedIn);
            sectionUI(sectionName);
        }

    });
}

renderIndex();



async function getaDoc() {
    const docRef = doc(db, "tracks", "hello-world");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        console.log(docSnap.data().SongName);
        console.log(docSnap.data().ArtistName);
        console.log(docSnap.data().SongUrl);
        console.log(docSnap.data().ImageUrl);
    } else {
        console.log("No such document!");
    }
}
// getaDoc();



const getAllTheDocs = function() {
    const q = query(collection(db, "tracks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        let tracks = [];
        snapshot.forEach((doc) => {
            tracks.push(doc);
        })
        tracks.forEach(track => {
            console.log(track);
        })
    });
}

// getAllTheDocs();










