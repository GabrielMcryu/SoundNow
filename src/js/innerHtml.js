import trackImage from '../img/img1.jpg';

export const loggedInNavUI = () => {
    let html = `
        <ul class="main-nav-list">
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
            <span style="text-align: center;">OR</span>
            <button id="google-sign-in">Sign In With Google</button>
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
        </div>
    </div>
    `;
    return html;
}

export const searchUI = () => {
    let html = `
    <div class="search-option">
        <input type="text" name="search" placeholder="Search here" id="search-input">
        <select name="choices" id="search-choice">
            <option value="all">All</option>
            <option value="artist">Artist</option>
            <option value="track-name">Track</option>
        </select>
        <button id="search-btn">Search</button>
    </div>
    <br><br>
    `;
    return html
}