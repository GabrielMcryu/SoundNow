export const convertSongName = (songName) => {
    const songPath = songName.toLowerCase().split(" ").join('-');
    return songPath;
    console.log(songPath);
}

export const hello = async function() {
    
}