import {
    getTracksFromFirestore,getTrackBySongName, 
    getTrackByArtistName, getTrackFromFirestore, 
    addCommentToFirestore, googleSignIn, faceBookSignIn, 
    anonymousSignIn, getTracksByUploaderId,emailSignIn, 
    registerUser,deleteTrackFromFirestore, deleteImageFromStorage, 
    deleteAudioFromStorage, deleteCommentsByTrackId, 
    updateSongNameToFirestore, updateArtistNameToFirestore,
    SaveTrackToFirestore, updateImageToFirestore, updateAudioToFirestore
} from './firebaseModel.js'

import { 
    loggedInNavUI, loggedOutNavUI, uploadUI, 
    loginUI, registerUI, trackUI, searchUI,
    addCommentUI, commentsUI, dashboardUI,
    uploaderTracksUI, updateTrackUI
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


///////////////////////////////////////////
// UI                                    //
///////////////////////////////////////////

// Renders Navigation UI
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

// Renders UI depending on Section depending on the page
const sectionUI = async function(sectionName, trackData = null, commentsData = null, userId = null, trackId = null) {
    sectionTag.innerHTML = '';
    if (sectionName === "main") {
        let tracks = await getTracksFromFirestore();
        renderMain(tracks);
    } else if(sectionName === "upload") {
        // Upload UI
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
            UploadImageToStorage(songName, artistName, songImage, songAudio, userId);
        });

    } else if(sectionName === "login") {
        // Login UI
        let html = loginUI();
        sectionTag.insertAdjacentHTML('afterbegin', html);

        const loginForm = document.querySelector('#login-form');
        const googleButton = document.querySelector('#google-sign-in');
        const faceBookButton = document.querySelector('#facebook-sign-in');
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
    } else if(sectionName === "register") {
        // Register UI
        let html = registerUI()
        sectionTag.insertAdjacentHTML('afterbegin', html);

        const registerForm = document.querySelector('#register-form');
        const googleButton = document.querySelector('#google-sign-in');
        const faceBookButton = document.querySelector('#facebook-sign-in');
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
        addCommentForm = document.querySelector('#upload-comment');
        addCommentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = addCommentForm.name.value;
            const comment = addCommentForm.comment.value;
            addCommentEvent(name, comment, trackId);
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

    } else if(sectionName === "user-uploads") {
        // User Uploads UI
        let tracks = await getTracksByUploaderId(userId);
        
        if(tracks.length == 0) {
            const noTracksText = `<p class="error-text">No Tracks Uploaded Yet...</p>`;
            sectionTag.insertAdjacentHTML('afterbegin', noTracksText);
    
        } else {
            tracks.forEach(function (track) {
                let html = uploaderTracksUI(track);
                sectionTag.insertAdjacentHTML('afterbegin', html);
                const btnChoice = document.querySelector('#btn-choice');
                const btnUpdate = document.querySelector('#btn-update');
                const btnDelete = document.querySelector('#btn-delete');
                btnChoice.addEventListener('click', (e) => {
                    const trackId = btnChoice.value;
                    trackEvents(trackId);
                });
                btnUpdate.addEventListener('click', (e) => {
                    renderUpdateTrack(track, userId);
                });
                btnDelete.addEventListener('click', (e) => {
                    deleteTrackFromFirebase(track, userId);
                });
            });
        }
    } else {
        console.log("hello world");
    }
}

// Sends data to addCommentToFirestore Function
const addCommentEvent = async function(name, comment, trackId) {
    await addCommentToFirestore(name, comment, trackId);
}

// Goes to designated SectionUI Choices
const renderUpload = function(isLoggedIn, userId = null) {
    if(isLoggedIn) {
        const sectionName = "upload";
        sectionUI(sectionName, null, null, userId, null);
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

const renderTrack = function(trackId, trackData, comments) {
    const sectionName = "track";
    sectionUI(sectionName, trackData, comments, null, trackId);
}

const renderUserUploads = function(userId) {
    const sectionName = "user-uploads";
    sectionUI(sectionName, null, null, userId, null);
}

////////////////////////////////////////////
// UPLOAD TRACK TO FIREBASE               //
////////////////////////////////////////////
// Uploads Image to Firebase storage and calls the UploadToStorage Function
async function UploadImageToStorage(songName, artistName, songImage, songAudio, userId) {
    sectionTag.innerHTML = `<div id="upload-view-tag" class="container upload-view"></div>`;
    let uploadViewTag = document.querySelector('#upload-view-tag');
    const imgName = songImage.name;

    const imageMetaData = {
        contentType: songImage.type
    }

    const imageStorageRef = sRef(storage, 'Images/' + imgName);

    const imageUploadTask = uploadBytesResumable(imageStorageRef, songImage, imageMetaData);

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
        getDownloadURL(imageUploadTask.snapshot.ref).then(async (downloadURL) => {
            await UploadToStorage(downloadURL, songName, artistName, userId, imgName, songAudio);
        })
    }
    );

}   

// Uploads Track to Firebase Storage and adds Track Data to firestore
async function UploadToStorage(imgUrl, songName, artistName, userId, imgName, songAudio) {
    sectionTag.innerHTML = `<div id="upload-view-tag" class="container upload-view"></div>`;
    let uploadViewTag = document.querySelector('#upload-view-tag');
    const audioName = songAudio.name;

    const audioMetaData = {
        contentType: songAudio.type
    }

    const audioStorageRef = sRef(storage, 'Tracks/' + audioName);

    const audioUploadTask = uploadBytesResumable(audioStorageRef, songAudio, audioMetaData);

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
        await getDownloadURL(audioUploadTask.snapshot.ref).then(async (downloadURL) => {
            uploadViewTag.innerHTML = `
                <p>Upload Complete! you'll be redirected in a few seconds</p>
            `;
            await SaveTrackToFirestore(imgUrl, downloadURL, songName, artistName, userId, imgName, audioName);
        })
        setTimeout(function () {
            renderIndex();
        }, 3000);
    }),
    );
    
}   


///////////////////////////////////////////////
// GET COMMENTS FROM FIRESTORE               //
///////////////////////////////////////////////
// Sends Data to the getCommentFromFirestore Function
const trackEvents = async function(trackId) {
    const trackData = await getTrackFromFirestore(trackId);
    getCommentsFromFirestore(trackData, trackId);
}

// Retrieves Comment Data from Firestore by TrackID
const getCommentsFromFirestore = function(trackData, trackId) {
    const colRef = collection(db, 'comments');
    const q = query(colRef, orderBy('createdAt'));
    const songName = trackData.SongName;
    const unsubscribe = onSnapshot(q,async (snapshot) => {
        let comments = [];
        snapshot.forEach((doc) => {
            if(doc.data().TrackId === trackId) {
                comments.push(doc.data());
            }
        });
        renderTrack(trackId, trackData, comments);
    });
}

///////////////////////////////////////////////
// Render MAIN AND NULL SEARCH SECTIONS      //
///////////////////////////////////////////////
// Loads Main Section
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
                const trackId = btnChoice.value;
                trackEvents(trackId);
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

// Loads Section when Search result shows Null
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

// Get User Input from search Field and sends it to respective functions
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

///////////////////////////////////////////////
// Render UPDATE UI SECTION                  //
///////////////////////////////////////////////
// Renders the Update Track Section
const renderUpdateTrack = function(trackData, userId) {
    const trackId = trackData[0];
    sectionTag.innerHTML = '';
    let html = updateTrackUI(trackData);
    sectionTag.insertAdjacentHTML('afterbegin', html);

    const songNameField = document.querySelector('#song-name-input');
    const artistNameField = document.querySelector('#artist-name-input');
    const trackImageField = document.querySelector('#track-image-input');
    const audioImageField = document.querySelector('#track-audio-input');

    const btnUpdateSongName = document.querySelector('#btn-update-song-name');
    const btnUpdateArtistName = document.querySelector('#btn-update-artist-name');
    const btnUpdateTrackImage = document.querySelector('#btn-update-track-image');
    const btnUpdateTrackAudio = document.querySelector('#btn-update-track-audio');

    btnUpdateSongName.addEventListener('click', (e) => {
        updateSongName(songNameField.value, trackId, userId);
    });
    btnUpdateArtistName.addEventListener('click', (e) => {
        updateArtistName(artistNameField.value, trackId, userId);
    });
    btnUpdateTrackImage.addEventListener('click', (e) => {
        updateImage(trackId, trackImageField.files[0], trackData[1].ImagePath, userId);
    });
    btnUpdateTrackAudio.addEventListener('click', (e) => {
        updateAudio(trackId, audioImageField.files[0], trackData[1].AudioPath, userId)
    });
}

// Updates Song Name
const updateSongName = async function(songName, trackId, userId) {
    await updateSongNameToFirestore(songName, trackId);
    renderUserUploads(userId);
}

// Updates Artist Name
const updateArtistName = async function(artistName, trackId, userId) {
    await updateArtistNameToFirestore(artistName, trackId);
    renderUserUploads(userId);
}

// Uploads New Image to Firebase Storage and Deletes Old Image
async function updateImage(trackId, songImage, imagePath, userId) {
    sectionTag.innerHTML = `<div id="upload-view-tag" class="container upload-view"></div>`;
    let uploadViewTag = document.querySelector('#upload-view-tag');
    const imgName = songImage.name;

    const imageMetaData = {
        contentType: songImage.type
    }

    const imageStorageRef = sRef(storage, 'Images/' + imgName);

    const imageUploadTask = uploadBytesResumable(imageStorageRef, songImage, imageMetaData);

    imageUploadTask.on('state-changed', (snapshot) => {
        const progress = Math.trunc((snapshot.bytesTransferred /snapshot.totalBytes) * 100);
        console.log('Upload is ' + progress + '% done');
        uploadViewTag.innerHTML = `
            <h2>Please wait as we update the Track Image</h2>
            <p>Image upload is ${progress}% done...</p>
        `;
    },
    (error) => {
        alert("error: image not uploaded");
    },
    (async () => {
        await getDownloadURL(imageUploadTask.snapshot.ref).then(async (downloadURL) => {
            uploadViewTag.innerHTML = `
                <p>Update Complete! you'll be redirected in a few seconds</p>
            `;
            await updateImageToFirestore(downloadURL, trackId, imgName);
            await deleteImageFromStorage(imagePath);
        })
        setTimeout(function () {
            renderUserUploads(userId);
        }, 3000);
    }),
    );
    
}   

// Uploads New Audio to Firebase Storage and Deletes Old Audio
async function updateAudio(trackId, songAudio, audioPath, userId) {
    sectionTag.innerHTML = `<div id="upload-view-tag" class="container upload-view"></div>`;
    let uploadViewTag = document.querySelector('#upload-view-tag');
    const audioName = songAudio.name;

    const audioMetaData = {
        contentType: songAudio.type
    }

    const audioStorageRef = sRef(storage, 'Tracks/' + audioName);

    const audioUploadTask = uploadBytesResumable(audioStorageRef, songAudio, audioMetaData);

    audioUploadTask.on('state-changed', (snapshot) => {
        const progress = Math.trunc((snapshot.bytesTransferred /snapshot.totalBytes) * 100);
        console.log('Upload is ' + progress + '% done');
        uploadViewTag.innerHTML = `
            <h2>Please wait as we update the Song</h2>
            <p>Song upload is ${progress}% done...</p>
        `;
    },
    (error) => {
        alert("error: audio not uploaded");
    },
    (async () => {
        await getDownloadURL(audioUploadTask.snapshot.ref).then(async (downloadURL) => {
            uploadViewTag.innerHTML = `
                <p>Update Complete! you'll be redirected in a few seconds</p>
            `;
            await updateAudioToFirestore(downloadURL, trackId, audioName);
            await deleteAudioFromStorage(audioPath);
        })
        setTimeout(function () {
            renderUserUploads(userId);
        }, 3000);
    }),
    );
    
}  

// Deletes Track and related Data
const deleteTrackFromFirebase = async function(track, userId) {
    const trackId = track[0]
    const trackImagePath = track[1].ImagePath;
    const trackAudioPath = track[1].AudioPath;

    await deleteCommentsByTrackId(trackId);
    await deleteTrackFromFirestore(trackId);
    await deleteImageFromStorage(trackImagePath);
    await deleteAudioFromStorage(trackAudioPath);

    renderUserUploads(userId);
}

/////////////////////////////////////////
// PLAY OPTIONS                        //
/////////////////////////////////////////
// Function to load track to play
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

/////////////////////////////////////////
// MAIN PAGE                           //
/////////////////////////////////////////
// load main page when page opens or when function called
const renderIndex = function() {
    onAuthStateChanged(auth, (user) => {
        let isLoggedIn
        const sectionName = "main";
        if(user) {
            if(user.isAnonymous) {
                isLoggedIn = false;
                navUI(isLoggedIn);
                sectionUI(sectionName);
            } else {
                const userId = user.uid;
                isLoggedIn = true;
                navUI(isLoggedIn, userId);
                sectionUI(sectionName);
            }
        } else {
            isLoggedIn = false;
            anonymousSignIn();
        }

    });
}

renderIndex();









