const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seek = document.getElementById('seek');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const playlistEl = document.getElementById('playlist');

const tracks = [
    {
        title: 'Dreamscape',
        artist: 'Nova Pulse',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
        title: 'Midnight Drive',
        artist: 'Oceanic Wave',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
        title: 'Starlight Groove',
        artist: 'Pixel Aurora',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    }
];

let currentIndex = 0;
let isPlaying = false;

function loadTrack(index) {
    const track = tracks[index];
    audio.src = track.src;
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    updateActiveTrack();
}

function updateActiveTrack() {
    document.querySelectorAll('.track-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === currentIndex);
    });
}

function playPause() {
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
}

function updateButtons() {
    playBtn.textContent = isPlaying ? 'Pause' : 'Play';
}

playBtn.addEventListener('click', playPause);
prevBtn.addEventListener('click', () => changeTrack(-1));
nextBtn.addEventListener('click', () => changeTrack(1));

audio.addEventListener('play', () => {
    isPlaying = true;
    updateButtons();
});

audio.addEventListener('pause', () => {
    isPlaying = false;
    updateButtons();
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        seek.value = progress;
        currentTime.textContent = formatTime(audio.currentTime);
        duration.textContent = formatTime(audio.duration);
    }
});

seek.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime = (seek.value / 100) * audio.duration;
    }
});

audio.addEventListener('ended', () => changeTrack(1));

function changeTrack(direction) {
    currentIndex = (currentIndex + direction + tracks.length) % tracks.length;
    loadTrack(currentIndex);
    if (isPlaying) {
        audio.play();
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function buildPlaylist() {
    tracks.forEach((track, idx) => {
        const item = document.createElement('div');
        item.className = 'track-item';
        item.innerHTML = `
            <div>
                <div class="title">${track.title}</div>
                <div class="artist">${track.artist}</div>
            </div>
            <span>▶</span>
        `;
        item.addEventListener('click', () => {
            currentIndex = idx;
            loadTrack(currentIndex);
            audio.play();
        });
        playlistEl.appendChild(item);
    });
}

buildPlaylist();
loadTrack(currentIndex);
