import { initializeApp } from 'firebase/app'
import firebaseConfig from './config.js'
import {
    getFirestore, collection, 
    getDocs, doc, setDoc, addDoc,
    updateDoc, getDoc, query, onSnapshot, 
    serverTimestamp, orderBy
} from 'firebase/firestore'

initializeApp(firebaseConfig);
const db = getFirestore();


///////////////////////////////////////////
// GET TRACKS FROM FIRESTORE
export const getTracksFromFirestore = async function() {
    let tracks = [];
    const q = query(collection(db, "tracks"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        tracks.push(doc.data());
    });
    return tracks;
}

export const getTrackBySongName = async function(songName) {
    let tracks = [];
    const q = query(collection(db, "tracks"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if(doc.data().SongName.toLowerCase().includes(songName)) {
                tracks.push(doc.data());
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
                tracks.push(doc.data());
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


///////////////////////////////////////////
// GET AND ADD COMMENTS TO FIRESTORE
export const addCommentToFirestore = async function(name, comment, songName) {
    const songRef = collection(db, 'comments');
    await addDoc(songRef, {
        Name: name,
        Comment: comment,
        SongName: songName,
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

export async function SaveToFirestore(imgUrl, songName, artistName, songPath) {
    const songRef = doc(db, 'tracks', songPath);
    await setDoc(songRef, {
        SongName: songName,
        ArtistName: artistName,
        ImageUrl: imgUrl
    }, { merge: true });

    console.log('image upload finished');
}
 
export async function SaveAudioToFirestore(songUrl, songPath) {
    const songRef = doc(db, "tracks", songPath);
    await updateDoc(songRef, {
        SongUrl: songUrl
    }, { merge: true });

    console.log('audio upload finished');
}
