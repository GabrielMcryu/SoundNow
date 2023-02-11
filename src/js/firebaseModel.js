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










 
export const getAllTheDocuments = function() {
    let tracks = [];
    const q = query(collection(db, "tracks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        
        snapshot.forEach((doc) => {
            tracks.push(doc);
        })
        
    });
    return tracks;
}

export const getAllTheDocumentes = () => {
    let h = 'hello world';
    return h;
}