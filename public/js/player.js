// Video Player Script

const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');

// Initialize Player
function initializePlayer(videoUrl, title = '') {
    if (!videoPlayer || !videoSource) return;

    videoSource.src = videoUrl;
    videoPlayer.load();
    videoPlayer.play();

    // Set metadata
    if (title) {
        videoPlayer.title = title;
    }

    // Add event listeners
    videoPlayer.addEventListener('play', onPlayerPlay);
    videoPlayer.addEventListener('pause', onPlayerPause);
    videoPlayer.addEventListener('ended', onPlayerEnded);
    videoPlayer.addEventListener('error', onPlayerError);
}

// Player Event Handlers
function onPlayerPlay() {
    console.log('Video dimulai');
}

function onPlayerPause() {
    console.log('Video dijeda');
}

function onPlayerEnded() {
    console.log('Video selesai');
}

function onPlayerError(event) {
    console.error('Video Error:', event);
    alert('Gagal memuat video. Silakan coba lagi.');
}

// Fullscreen
function toggleFullscreen() {
    if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
    } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
    }
}

// Quality Change (placeholder)
function changeQuality(quality) {
    console.log(`Changing quality to: ${quality}`);
    // Implement quality switching logic here
}

// Playback Speed
function setPlaybackSpeed(speed) {
    if (videoPlayer) {
        videoPlayer.playbackRate = speed;
    }
}

// Volume Control
function setVolume(volume) {
    if (videoPlayer) {
        videoPlayer.volume = volume / 100;
    }
}

// Get Player State
function getPlayerState() {
    return {
        currentTime: videoPlayer?.currentTime || 0,
        duration: videoPlayer?.duration || 0,
        paused: videoPlayer?.paused || false,
        volume: (videoPlayer?.volume || 0) * 100,
        playbackRate: videoPlayer?.playbackRate || 1
    };
}

// Save Player State to LocalStorage
function savePlayerState(dramaId, episodeNum, state) {
    try {
        const key = `player_${dramaId}_${episodeNum}`;
        localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
        console.error('Gagal menyimpan player state:', error);
    }
}

// Load Player State from LocalStorage
function loadPlayerState(dramaId, episodeNum) {
    try {
        const key = `player_${dramaId}_${episodeNum}`;
        const state = localStorage.getItem(key);
        return state ? JSON.parse(state) : null;
    } catch (error) {
        console.error('Gagal memuat player state:', error);
        return null;
    }
}

// Auto-save player state every 10 seconds
setInterval(() => {
    if (videoPlayer && !videoPlayer.paused) {
        const state = getPlayerState();
        savePlayerState(currentDramaId, 'current', state);
    }
}, 10000);
