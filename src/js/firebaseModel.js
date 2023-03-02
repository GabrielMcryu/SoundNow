import { initializeApp } from 'firebase/app'
import firebaseConfig from './config.js'
import {
    getFirestore, collection, 
    getDocs, doc, addDoc,
    updateDoc, getDoc, query,
    serverTimestamp, deleteDoc
} from 'firebase/firestore'

import {
    getAuth, signInWithEmailAndPassword, 
    getRedirectResult, GoogleAuthProvider, signInWithRedirect,
    createUserWithEmailAndPassword, FacebookAuthProvider, signInAnonymously
} from 'firebase/auth'

import { 
    getStorage, ref, deleteObject 
} from "firebase/storage";


initializeApp(firebaseConfig);

const auth = getAuth();
const fbProvider = new FacebookAuthProvider();
const provider = new GoogleAuthProvider();

const storage = getStorage();
const db = getFirestore();

//////////////////////////////////////////////
// AUTHENTICATION                           //
//////////////////////////////////////////////
// Lets user Sign in with email
export const emailSignIn = async function(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log("user logged in", cred.user);
        })
        .catch((err) => {
            console.log(err.message)
        });
}

// Lets user Sign in with Google
export const googleSignIn = async function() {
    signInWithRedirect(auth, provider);

    getRedirectResult(auth)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access Google APIs.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
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

// Lets user sign in with Facebook
export const faceBookSignIn = async function() {
    signInWithRedirect(auth, fbProvider);

    getRedirectResult(auth)
  .then((result) => {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    const user = result.user;
    console.log(user);
    console.log(auth);
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // AuthCredential type that was used.
    const credential = FacebookAuthProvider.credentialFromError(error);
    // ...
  });
}

// Lets user sign in anonymously
export const anonymousSignIn = async function() {
    signInAnonymously(auth)
  .then(() => {
    // location.reload();
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });
}

export const registerUser = async function(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log('user created: ', cred.user);
        })
        .catch((err) => {
            console.log(err.message);
    });
}

/////////////////////////////////////////////
// GET TRACKS FROM FIRESTORE               //
/////////////////////////////////////////////
// Gets all tracks from firestore
export const getTracksFromFirestore = async function() {
    let tracks = [];
    let tracksWithId = [];
    const q = query(collection(db, "tracks"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        tracks.push([doc.id, doc.data()]);
    });
    return tracks;
}

// Gets tracks from Firestore by SongName
export const getTrackBySongName = async function(songName) {
    let tracks = [];
    const q = query(collection(db, "tracks"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if(doc.data().SongName.toLowerCase().includes(songName)) {
                tracks.push([doc.id, doc.data()]);
        }
    });
    return tracks;
}

// Gets Tracks from firestore by ArtistName
export const getTrackByArtistName = async function(artistName) {
    let tracks = [];
    const q = query(collection(db, "tracks"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if(doc.data().ArtistName.toLowerCase().includes(artistName)) {
                tracks.push([doc.id, doc.data()]);
        }
    });
    return tracks;
}

// Gets Tracks from firestore by Uploader Id
export const getTracksByUploaderId = async function(userId) {
    let tracks = [];
    const q = query(collection(db, "tracks"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if(doc.data().UploaderId.includes(userId)) {
            tracks.push([doc.id, doc.data()]);
        }
    });
    return tracks;
}

// Gets one Track from firestore by Track Id
export const getTrackFromFirestore = async function(trackId) {
    let trackData = {};
    const docRef = doc(db, "tracks", trackId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        trackData = docSnap.data();
    } else {
        console.log("No such document!");
    }
    return trackData;
}

/////////////////////////////////////////////
// DELETE TRACK FROM FIRESTORE AND STORAGE //
/////////////////////////////////////////////
// Delete Track from firestore by TrackId
export const deleteTrackFromFirestore = async function(trackId) {
    await deleteDoc(doc(db, "tracks", trackId));
}

// Delete Image from Firebase Storage
export const deleteImageFromStorage = async function(imagePath) {
    const imageRef = ref(storage, `Images/${imagePath}`);
    // Delete the Image
    await deleteObject(imageRef).then(() => {
        console.log('Image deleted');
    }).catch((error) => {
        console.log('error occured while deleting image');
    });
}

// Delete Audio From Firebase Storage
export const deleteAudioFromStorage = async function(audioPath) {
    const audioRef = ref(storage, `Tracks/${audioPath}`);
    // Delete the Audio
    await deleteObject(audioRef).then(() => {
        console.log('Audio deleted');
    }).catch((error) => {
        console.log('error occured while deleting audio');
    });
}

// Delete Comments from Firebase by TrackId
export const deleteCommentsByTrackId = async function(trackId) {
    const q = query(collection(db, "comments"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
        if(document.data().TrackId.includes(trackId)) {
            await deleteDoc(doc(db, "comments", document.id));
        }
    });
}

/////////////////////////////////////////////
// GET COMMENTS FROM FIRESTORE             //
/////////////////////////////////////////////
export const addCommentToFirestore = async function(name, comment, trackId) {
    const songRef = collection(db, 'comments');
    await addDoc(songRef, {
        Name: name,
        Comment: comment,
        TrackId: trackId,
        createdAt: serverTimestamp()
    }).then(() => {
        console.log('comment added');
    });
}

/////////////////////////////////////////////
// UPLOAD TRACK TO FIREBASE                //
/////////////////////////////////////////////
// Save Track data to Firestore
export async function SaveTrackToFirestore(imgUrl, songUrl, songName, artistName, userId, imagePath, audioPath) {
    const songRef = collection(db, 'tracks');
    await addDoc(songRef, {
        SongName: songName,
        ArtistName: artistName,
        ImageUrl: imgUrl,
        SongUrl: songUrl,
        UploaderId: userId,
        ImagePath: imagePath,
        AudioPath: audioPath
    }, { merge: true });
}

/////////////////////////////////////////////
// UPDATE TO FIREBASE                      //
/////////////////////////////////////////////
// Updates Song Name Using Track Id
export async function updateSongNameToFirestore(songName, trackId) {
    const songRef = doc(db, "tracks", trackId);
    await updateDoc(songRef, {
        SongName: songName
    }, { merge: true });
}

// Updates Artist Name Using Track Id
export async function updateArtistNameToFirestore(artistName, trackId) {
    const songRef = doc(db, "tracks", trackId);
    await updateDoc(songRef, {
        ArtistName: artistName
    }, { merge: true });
}

// Updates Image data to Firestore By Track Id
export async function updateImageToFirestore(imageUrl, trackId, imgPath) {
    const songRef = doc(db, "tracks", trackId);
    await updateDoc(songRef, {
        ImageUrl: imageUrl,
        ImagePath: imgPath
    }, { merge: true });
}

// Updates Audio data to Firestore By Track Id
export async function updateAudioToFirestore(songUrl, trackId, audioPath) {
    const songRef = doc(db, "tracks", trackId);
    await updateDoc(songRef, {
        SongUrl: songUrl,
        AudioPath: audioPath
    }, { merge: true });
}