import { initializeApp } from 'firebase/app'
import firebaseConfig from './config.js'
import {
    getFirestore, collection, 
    getDocs, doc, setDoc, addDoc,
    updateDoc, getDoc, query, onSnapshot, 
    serverTimestamp, orderBy, deleteDoc
} from 'firebase/firestore'

import {
    getAuth, signInWithEmailAndPassword, 
    onAuthStateChanged, signOut, getRedirectResult,
    GoogleAuthProvider, signInWithRedirect, TwitterAuthProvider,
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
// AUTHENTICATION
export const emailSignIn = async function(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log("user logged in", cred.user);
        })
        .catch((err) => {
            console.log(err.message)
        });
}

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

export const faceBookSignIn = async function() {
    signInWithRedirect(auth, fbProvider);

    getRedirectResult(auth)
  .then((result) => {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    const user = result.user;
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

///////////////////////////////////////////
// GET TRACKS FROM FIRESTORE
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

export const getTrackFromFirestore = async function(trackPath) {
    let trackData = {};
    const docRef = doc(db, "tracks", trackPath);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        trackData = docSnap.data();
    } else {
        console.log("No such document!");
    }
    return trackData;
}

////////////////////////////////////////////
// DELETE TRACK FROM FIRESTORE AND STORAGE
export const deleteTrackFromFirestore = async function(trackId) {
    await deleteDoc(doc(db, "tracks", trackId));
}

export const deleteImageFromStorage = async function(imagePath) {
    const imageRef = ref(storage, `Images/${imagePath}`);
    // Delete the Image
    await deleteObject(imageRef).then(() => {
        console.log('Image deleted');
    }).catch((error) => {
        console.log('error occured while deleting image');
    });
}

export const deleteAudioFromStorage = async function(audioPath) {
    const audioRef = ref(storage, `Tracks/${audioPath}`);
    // Delete the Audio
    await deleteObject(audioRef).then(() => {
        console.log('Audio deleted');
    }).catch((error) => {
        console.log('error occured while deleting audio');
    });
}

export const deleteCommentsByTrackId = async function(trackId) {
    const q = query(collection(db, "comments"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
        if(document.data().TrackId.includes(trackId)) {
            await deleteDoc(doc(db, "comments", document.id));
        }
    });
}

///////////////////////////////////////////
// GET AND ADD COMMENTS TO FIRESTORE
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

// to be updated
export const getCommentsFromFirestore2 = async function(trackData) {
    let comments = [];
    const colRef = collection(db, 'comments');
    const q = query(colRef, orderBy('createdAt'));
    const songName = trackData.SongName;
    const unsubscribe = onSnapshot(q,async (snapshot) => {
        snapshot.forEach(async (doc) => {
            if(doc.data().SongName === songName) {
                comments.push(doc.data());
            }
        });
        // renderTrack(trackData, comments);
    });
    console.log(comments.length);
    return comments;
}


////////////////////////////////////////////
// UPLOAD TRACK TO FIREBASE

export async function SaveToFirestore(imgUrl, songName, artistName, songPath, userId, imagePath, audioPath) {
    const songRef = doc(db, 'tracks', songPath);
    await setDoc(songRef, {
        SongName: songName,
        ArtistName: artistName,
        ImageUrl: imgUrl,
        UploaderId: userId,
        ImagePath: imagePath,
        AudioPath: audioPath,
    }, { merge: true });

    console.log('image upload finished');
}

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
 
export async function SaveAudioToFirestore(songUrl, songPath) {
    const songRef = doc(db, "tracks", songPath);
    await updateDoc(songRef, {
        SongUrl: songUrl
    }, { merge: true });

    console.log('audio upload finished');
}

////////////////////////////////////////////
// UPDATE TO FIREBASE
export async function updateSongNameToFirestore(songName, trackId) {
    const songRef = doc(db, "tracks", trackId);
    await updateDoc(songRef, {
        SongName: songName
    }, { merge: true });
}

export async function updateArtistNameToFirestore(artistName, trackId) {
    const songRef = doc(db, "tracks", trackId);
    await updateDoc(songRef, {
        ArtistName: artistName
    }, { merge: true });
}

export async function updateImageToFirestore(imageUrl, trackId, imgPath) {
    const songRef = doc(db, "tracks", trackId);
    await updateDoc(songRef, {
        ImageUrl: imageUrl,
        ImagePath: imgPath
    }, { merge: true });
}

export async function updateAudioToFirestore(songUrl, trackId, audioPath) {
    const songRef = doc(db, "tracks", trackId);
    await updateDoc(songRef, {
        SongUrl: songUrl,
        AudioPath: audioPath
    }, { merge: true });
}