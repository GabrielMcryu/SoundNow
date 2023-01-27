import trackImage from '../img/img1.jpg';

export const loggedInNavUI = () => {
    let html = `
        <ul class="main-nav-list">
            <li><a class="main-nav-link" href="javascript:" id="upload">Upload Song</a></li>
            <li><a class="main-nav-link" href="javascript:" id="dashboard">Dashboard</a></li>
            <li><a class="main-nav-link logout" href="index.html">Logout</a></li>
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

export const dashboardUI = () => {
    let html = `
    <div class="container track">
        <div class="track-details">
            <img class="track-image" src="${trackImage}" alt="">
            <div class="track-description">
                <h2>Song Name</h2>
                <p>By: Artist</p>
            </div>
        </div>

        <div class="track-song">
            <button class="track-play">
                <i class="fas fa-play"></i>
            </button>

            <div class="track-vol">
                <i class="fas fa-volume-up" id="volume-icon"></i>
            </div>

            <input 
            type="range"
            id="track-volume"
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

    <div class="container track">
        <div class="track-details">
            <img class="track-image" src="${trackImage}" alt="">
            <div class="track-description">
                <h2>Song Name</h2>
                <p>By: Artist</p>
            </div>
        </div>

        <div class="track-song">
            <button class="track-play">
                <i class="fas fa-play"></i>
            </button>
            <div class="track-vol">
                <i class="fas fa-volume-up" id="volume-icon"></i>
            </div>
            <input 
            type="range"
            id="track-volume"
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
            <form action="" id="login-form">
                <label class="form-label">Song Name:</label>
                <input class="input-field" type="text" name="song-name">

                <label class="form-label">Upload Song Image:</label>
                <input class="input-field input-btn" type="file" name="song-image" accept="image/png, image/jpeg">

                <label class="form-label">Upload Song:</label>
                <input class="input-field input-btn" type="file" name="song" accept="audio/mp3">

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