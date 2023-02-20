import trackImage from '../img/img1.jpg';

export const loggedInNavUI = () => {
    let html = `
        <ul class="main-nav-list">
            <li><a class="main-nav-link" href="javascript:" id="user-uploads">My Uploads</a></li>
            <li><a class="main-nav-link" href="javascript:" id="upload">Upload Song</a></li>
            <li><a class="main-nav-link" href="javascript:" id="dashboard">Dashboard</a></li>
            <li><a class="main-nav-link logout" href="javascript:">Logout</a></li>
        </ul>
    `;
    return html;
}

export const loggedOutNavUI = () => {
    let html = `
        <ul class="main-nav-list">
            <li><a class="main-nav-link" href="javascript:" id="upload">Upload Song</a></li>
            <li><a class="main-nav-link" href="javascript:" id="dashboard">Dashboard</a></li>
            <li><a class="main-nav-link" href="javascript:" id="login">Login</a></li>
            <li><a class="main-nav-link" href="javascript:" id="register">Register</a></li>
        </ul>
    `;
    return html;
}

export const dashboardUI = (track) => {
    let html = `
    <div class="container-track track">
        <div class="track-details">
            <img class="track-image" id="track-image" src="${track[1].ImageUrl}" alt="">
            <div class="track-description">
                <h2>${track[1].SongName}</h2>
                <p>${track[1].ArtistName}</p>
            </div>
            <div class="track-choice">
                <button class="btn-track-choice" id="btn-choice" value="${track[0]}">Play</button>
            </div>
        </div>
    </div>
    `;
    return html;
}

export const trackUI = (trackData) => {
    let html = `
    <div class="container">
        <div class="image-view">
            <img src="${trackData.ImageUrl}" alt="" class="my-image">
        </div>
        <div class="track-song track-shadow">
            <button class="track-play" id="play">
                <i class="fas fa-play"></i>
            </button>

            <div class="track-vol" id="track-vol-div">
                <i class="fas fa-volume-up" id="volume-icon"></i>
            </div>

            <input 
            type="range"
            id="track-volume-slider"
            min="0"
            max="100"
            value="50">

            <span class="current-time">00:12</span>

            <input 
            type="range" 
            class="duration-slider"
            min="0"
            max="100"
            value="0">
            
            <span class="duration-time">04:10</span>
        </div>
    </div>
    `;
    return html;
}

export const uploadUI = () => {
    let html = `
    <div class="container upload">
        <div class="form">
            <h2 class="form-header">Upload a Song</h2>
            <form action="" id="upload-form">
                <label class="form-label">Song Name:</label>
                <input class="input-field" type="text" name="songName">

                <label class="form-label">Artist Name:</label>
                <input class="input-field" type="text" name="artistName">

                <label class="form-label">Upload Song Image:</label>
                <input class="input-field input-btn" type="file" name="songImage" accept="image/png, image/jpeg">

                <label class="form-label">Upload Song:</label>
                <input class="input-field input-btn" type="file" name="songAudio" accept="audio/mp3">

                <input class="submit-btn" type="submit" value="Upload">
            </form>
        </div>
    </div>
    `;
    return html;
}

export const loginUI = () => {
    let html = `
    <div class="container login">
        <div class="form">
            <h2 class="form-header">Login</h2>
            <form action="" id="login-form">
                <label class="form-label">Email:</label>
                <input class="input-field" type="text" name="email">

                <label class="form-label">Password:</label>
                <input class="input-field" type="password" name="password">

                <input class="submit-btn" type="submit" value="Login">
            </form>

            <div class="form-text">
                <p>OR SIGN IN WITH</p>
            </div>
            
            <div class="form-buttons">
                <button class="button-social button-google" id="google-sign-in">Google</button>
                <button class="button-social button-facebook" id="facebook-sign-in">Facebook</button>
                <!-- <button class="button-social button-anonymous" id="anonymous-sign-in">Anonymously</button> -->
            </div>
        </div>
    </div>
    `;
    return html
}

export const registerUI = () => {
    let html = `
    <div class="container register" id="registration">
        <div class="form">
            <h2 class="form-header">Register</h2>
            <form action="" id="register-form">
                <label class="form-label">Email:</label>
                <input class="input-field" type="text" name="email">

                <label class="form-label">Password:</label>
                <input class="input-field" type="password" name="password">

                <input class="submit-btn" type="submit" value="Register">
            </form>

            <div class="form-text">
                <p>OR SIGN IN WITH</p>
            </div>
            
            <div class="form-buttons">
                <button class="button-social button-google" id="google-sign-in">Google</button>
                <button class="button-social button-facebook" id="facebook-sign-in">Facebook</button>
                <!-- <button class="button-social button-anonymous" id="anonymous-sign-in">Anonymously</button> -->
            </div>
        </div>
    </div>
    `;
    return html;
}

export const searchUI = () => {
    let html = `
    <div class="search-option">
        <input class="search-field" type="text" name="search" placeholder="Search here" id="search-input">
        <select class="select-field" name="choices" id="search-choice">
            <option value="all">All</option>
            <option value="artist">Artist</option>
            <option value="track-name">Track</option>
        </select>
        <button class="btn-search" id="search-btn">Search</button>
    </div>
    <br><br>
    `;
    return html
}

export const addCommentUI = () => {
    let html = `
    <div class="comment-form">
        <h2>Add a Comment</h2>
        <form action="" id="upload-comment">
            <label class="form-label">Name:</label>
            <input class="input-field" type="text" name="name">
        
            <label class="form-label" >Comment</label>
            <textarea class="comment-area" name="comment" cols="30" rows="3"></textarea>
            <input class="submit-btn" type="submit" value="Submit">
        </form>
    </div>
    <br><br>
    `;
    return html;
}

export const commentsUI = (name, comment, commentDate) => {
    let html = `
    <div class="comment-section">
        <p class="text-sub"><span class="c-name">${name}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-date">${commentDate}</span></p>
        <p class="text-main">${comment}</p>
    </div>
    <br><br>
    `;
    return html;
}

export const uploaderTracksUI = (track) => {
    let html = `
    <div class="container-track track">
        <div class="track-details">
            <img class="track-image" id="track-image" src="${track[1].ImageUrl}" alt="">
            <div class="track-description">
                <h2>${track[1].SongName}</h2>
                <p>${track[1].ArtistName}</p>
            </div>
            <div class="track-choice">
                <button class="btn-track-choice" id="btn-choice" value="${track[0]}">Play</button>
                <button class="btn-track-update" id="btn-update" value="${track[0]}">Update</button>
                <button class="btn-track-delete" id="btn-delete" value="${track[0]}">Delete</button>
            </div>
        </div>
    </div>
    `;
    return html;
}

export const updateTrackUI = (trackData) => {
    let html = `
    <div class="container upload">
        <div class="form">
            <h2 class="form-header">Update Track</h2>
            <label class="form-label">Song Name:</label>
            <div class="update-input">
                <input class="update-input-field" id="song-name-input" value="${trackData[1].SongName}" type="text" name="songName">
                <button class="update-input-button" id="btn-update-song-name" value="">Update</button>
            </div>

            <label class="form-label">Artist Name:</label>
            <div class="update-input">
                <input class="update-input-field" id="artist-name-input" value="${trackData[1].ArtistName}" type="text" name="artistName">
                <button class="update-input-button" id="btn-update-artist-name" value="">Update</button>
            </div>
            

            <label class="form-label">Upload Song Image:</label>
            <div class="update-input">
                <input class="update-input-field input-btn" id="track-image-input" type="file" name="songImage" accept="image/png, image/jpeg">
                <button class="update-input-button" id="btn-update-track-image" value="">Update</button>
            </div>
            

            <label class="form-label">Upload Song:</label>
            <div class="update-input">
                <input class="update-input-field input-btn" id="track-audio-input" type="file" name="songAudio" accept="audio/mp3">
                <button class="update-input-button" id="btn-update-track-audio" value="">Update</button>
            </div>
        </div>
    </div>
    `;
    return html;
}