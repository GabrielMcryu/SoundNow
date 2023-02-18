import {
    convertSongName
} from './upload.js'

import {
    getTracksFromFirestore,getTrackBySongName, 
    getTrackByArtistName, getTrackFromFirestore, 
    addCommentToFirestore, SaveToFirestore, 
    SaveAudioToFirestore, googleSignIn, 
    faceBookSignIn, anonymousSignIn,
    emailSignIn, registerUser, getCommentsFromFirestore2
} from './firebaseModel.js'

import { 
    loggedInNavUI, loggedOutNavUI, uploadUI, 
    loginUI, registerUI, trackUI, searchUI,
    addCommentUI, commentsUI, dashboardUI
}from './innerHtml.js'

import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection,
    query, onSnapshot, orderBy
} from 'firebase/firestore'
import firebaseConfig from './config.js'
import {
    getAuth, onAuthStateChanged, signOut, 
} from 'firebase/auth'

import {
    getStorage, ref as sRef,
    uploadBytesResumable, getDownloadURL
} from 'firebase/storage'

initializeApp(firebaseConfig);

const auth = getAuth();

const db = getFirestore();

const storage = getStorage();

const navigation = document.querySelector('#nav');
const sectionTag = document.querySelector('#section');

let track = document.createElement("audio");
let play;
let timer;
let slider;
let VolIconDiv;
let volumeSlider;
let trackCurrentTime;
let trackDuration;
let songIsPlaying = false;


///////////////////////////////////////
// UI
const navUI = function(isloggedIn, userId = null) {
    navigation.innerHTML = '';
    let html;
    let logout;
    let upload;
    let loginLink;
    let registerLink;
    let userUploadLink;
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
            renderUpload(isloggedIn, userId);
        });

        dashboard = document.querySelector('#dashboard');
        dashboard.addEventListener('click', () => {
            renderIndex();
        });

        userUploadLink = document.querySelector('#user-uploads');
        userUploadLink.addEventListener('click', () => {
            renderUserUploads(userId);
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

const sectionUI = async function(sectionName, trackData = null, commentsData = null, userId = null) {
    sectionTag.innerHTML = '';
    if (sectionName === "main") {
        let tracks = await getTracksFromFirestore();
        renderMain(tracks);
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
            console.log(songImage.name);
            console.log(songAudio.name);
            UploadToStorage(songName, artistName, songImage, songAudio, userId);
        });

    } else if(sectionName === "login") {
        let html = loginUI();
        sectionTag.insertAdjacentHTML('afterbegin', html);

        const loginForm = document.querySelector('#login-form');
        const googleButton = document.querySelector('#google-sign-in');
        const faceBookButton = document.querySelector('#facebook-sign-in');
        // const anonymousButton = document.querySelector('#anonymous-sign-in');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            emailSignIn(email, password);
        });
        googleButton.addEventListener('click', (e) => {
            googleSignIn();
        });
        faceBookButton.addEventListener('click', (e) => {
            faceBookSignIn();
        });
        // anonymousButton.addEventListener('click', (e) => {
        //     anonymousSignIn();
        // });
    } else if(sectionName === "register") {
        let html = registerUI()
        sectionTag.insertAdjacentHTML('afterbegin', html);

        const registerForm = document.querySelector('#register-form');
        const googleButton = document.querySelector('#google-sign-in');
        const faceBookButton = document.querySelector('#facebook-sign-in');
        const anonymousButton = document.querySelector('#anonymous-sign-in');
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            registerUser(email, password);
        });
        googleButton.addEventListener('click', (e) => {
            googleSignIn();
        });
        faceBookButton.addEventListener('click', (e) => {
            faceBookSignIn();
        });
        anonymousButton.addEventListener('click', (e) => {
            anonymousSignIn();
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
            addCommentEvent(name, comment, songName);
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
        const focusTrackSection = document.querySelector('.image-view');
        
        focusTrackSection.scrollIntoView();

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

const addCommentEvent = async function(name, comment, songName) {
    await addCommentToFirestore(name, comment, songName);
}

const renderUpload = function(isLoggedIn, userId = null) {
    if(isLoggedIn) {
        const sectionName = "upload";
        sectionUI(sectionName, null, null, userId);
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
    sectionUI(sectionName, trackData, comments, null);
}

const renderUserUploads = function(userId) {
    console.log(userId);
}

////////////////////////////////////////////
// UPLOAD TRACK TO FIREBASE

async function UploadToStorage(songName, artistName, songImage, songAudio, userId) {
    sectionTag.innerHTML = `<div id="upload-view-tag" class="container upload-view"></div>`;
    let uploadViewTag = document.querySelector('#upload-view-tag');
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
        const progress = Math.trunc((snapshot.bytesTransferred /snapshot.totalBytes) * 100);
        console.log('Upload is ' + progress + '% done');
        uploadViewTag.innerHTML = `
            <h2>Please wait as we upload your track</h2>
            <p>Image upload is ${progress}% done...</p>
        `;
    },
    (error) => {
        alert("error: image not uploaded");
    },
    () => {
        getDownloadURL(imageUploadTask.snapshot.ref).then((downloadURL) => {
            SaveToFirestore(downloadURL, songName, artistName, songPath, userId, songImage.name, songAudio.name)
        })
    }
    );

    audioUploadTask.on('state-changed', (snapshot) => {
        const progress = Math.trunc((snapshot.bytesTransferred /snapshot.totalBytes) * 100);
        console.log('Upload is ' + progress + '% done');
        uploadViewTag.innerHTML = `
            <h2>Please wait as we upload your track</h2>
            <p>Image upload is 100% done...</p>
            <p>Audio upload is ${progress}% done...</p>
        `;
    },
    (error) => {
        alert("error: audio not uploaded");
    },
    (async () => {
        await getDownloadURL(audioUploadTask.snapshot.ref).then((downloadURL) => {
            uploadViewTag.innerHTML = `
                <p>Upload Complete! you'll be redirected in a few seconds</p>
            `;
            SaveAudioToFirestore(downloadURL, songPath);
            
        })
        setTimeout(function () {
            renderIndex();
        }, 3000);
    }),
    );

    
}   

///////////////////////////////////////////
// GET COMMENTS FROM FIRESTORE
const getCommentsFromFirestore = function(trackData) {
    const colRef = collection(db, 'comments');
    const q = query(colRef, orderBy('createdAt'));
    const songName = trackData.SongName;
    const unsubscribe = onSnapshot(q,async (snapshot) => {
        let comments = [];
        snapshot.forEach((doc) => {
            if(doc.data().SongName === songName) {
                comments.push(doc.data());
            }
        });
        renderTrack(trackData, comments);
    });
}


const renderMain = async function(tracks) {
    sectionTag.innerHTML = '';
    
    if(tracks.length == 0) {
        const noTracksText = `<p class="error-text">No Tracks Uploaded Yet...</p>`;
        sectionTag.insertAdjacentHTML('afterbegin', noTracksText);

    } else {
        tracks.forEach(function (track) {
            let html = dashboardUI(track);
            sectionTag.insertAdjacentHTML('afterbegin', html);
            const btnChoice = document.querySelector('#btn-choice');
            btnChoice.addEventListener('click', (e) => {
                const trackName = btnChoice.value;
                const trackPath = convertSongName(trackName);
                trackEvents(trackPath);
            });
        });
    }

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
            searchEvents(searchField.value.trim().toLowerCase(), 'artist');
        } else if(searchChoices.value === 'track-name') {
            searchEvents(searchField.value.trim().toLowerCase(), 'track-name');
        }
    });
    
}

const trackEvents = async function(trackPath) {
    const trackData = await getTrackFromFirestore(trackPath);
    // const comments = await getCommentsFromFirestore2(trackData);
    getCommentsFromFirestore(trackData);
    // renderTrack(trackData, comments);
}

const searchEvents = async function(inputData, searchChoice) {
    if(searchChoice === 'track-name') {
        let tracks = await getTrackBySongName(inputData);
        if(tracks.length < 1) {
            const errorMessage = '<p class="error-text">No such Track Name found.</p>';
            renderNullSearch(errorMessage);
        } 
        else {
            renderMain(tracks)
        }
    } else if(searchChoice === 'artist') {
        let tracks = await getTrackByArtistName(inputData);
        if(tracks.length < 1) {
            const errorMessage = '<p class="error-text">No such Artist Name found.</p>';
            renderNullSearch(errorMessage);
        } 
        else {
            renderMain(tracks)
        }
    }
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
            searchEvents(searchField.value.trim().toLowerCase(), 'artist');
        } else if(searchChoices.value === 'track-name') {
            searchEvents(searchField.value.trim().toLowerCase(), 'track-name');
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
            if(user.isAnonymous) {
                console.log('anonymous');
                isLoggedIn = false;
                navUI(isLoggedIn);
                sectionUI(sectionName);
            } else {
                console.log('not anonymous');
                console.log(user.uid);
                const userId = user.uid;
                isLoggedIn = true;
                navUI(isLoggedIn, userId);
                sectionUI(sectionName);
            }
        } else {
            isLoggedIn = false;
            anonymousSignIn();
            // navUI(isLoggedIn);
            // sectionUI(sectionName);
        }

    });
}

renderIndex();









