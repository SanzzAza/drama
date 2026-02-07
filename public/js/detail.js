// Drama Detail Page Script

let currentDramaId = null;
let currentEpisodes = [];

function getDramaIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = Number.parseInt(params.get('id'), 10);
    if (!Number.isNaN(fromQuery) && fromQuery > 0) {
        return fromQuery;
    }

    const pathname = window.location.pathname;
    const match = pathname.match(/\/drama\/(\d+)/);
    if (match && match[1]) {
        const fromPath = Number.parseInt(match[1], 10);
        if (!Number.isNaN(fromPath) && fromPath > 0) {
            return fromPath;
        }
    }

    return null;
}

function resolveEpisodeNumber(episode) {
    return episode.episode || episode.ep || episode.number || episode.no || '?';
}

function resolveEpisodeTitle(episode) {
    const episodeNum = resolveEpisodeNumber(episode);
    return episode.title || episode.name || episode.judul || `Episode ${episodeNum}`;
}

function resolveEpisodeVideoUrl(episode) {
    return episode.url || episode.video_url || episode.play_url || episode.stream_url || episode.link || '';
}

document.addEventListener('DOMContentLoaded', () => {
    currentDramaId = getDramaIdFromURL();

    if (!currentDramaId) {
        showError('ID Drama tidak valid');
        return;
    }

    loadDramaDetail();
    setupDetailEventListeners();
});

function setupDetailEventListeners() {
    const filterBtn = document.getElementById('filterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const episodeFilter = document.getElementById('episodeFilter');

    if (filterBtn) {
        filterBtn.addEventListener('click', filterEpisodes);
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            if (episodeFilter) {
                episodeFilter.value = '';
            }
            displayEpisodes(currentEpisodes);
        });
    }

    if (episodeFilter) {
        episodeFilter.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterEpisodes();
            }
        });
    }
}

async function loadDramaDetail() {
    try {
        const detailLoader = document.getElementById('dramaDetailLoader');
        showLoader(detailLoader);

        const response = await dramaAPI.getDetail(currentDramaId);

        if (response.success) {
            const { drama, episodes } = response.data;
            currentEpisodes = Array.isArray(episodes) ? episodes : [];

            displayDramaDetail(drama);
            displayEpisodes(currentEpisodes);
            return;
        }

        showError(response.message || 'Gagal memuat detail drama');
    } catch (error) {
        showError(handleAPIError(error));
    }
}

function displayDramaDetail(drama) {
    const detailLoader = document.getElementById('dramaDetailLoader');
    const dramaDetail = document.getElementById('dramaDetail');
    const errorState = document.getElementById('errorState');

    hideLoader(detailLoader);

    if (!drama || Object.keys(drama).length === 0) {
        if (dramaDetail) dramaDetail.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        return;
    }

    document.title = `${drama.title || drama.name || 'Drama'} - FlickReels`;

    const poster = document.getElementById('dramaPoster');
    const title = document.getElementById('dramaTitle');
    const year = document.getElementById('dramaYear');
    const genre = document.getElementById('dramaGenre');
    const description = document.getElementById('dramaDescription');
    const status = document.getElementById('dramaStatus');
    const episodeCount = document.getElementById('episodeCount');

    if (poster) {
        poster.src = drama.poster_path || drama.poster || 'https://via.placeholder.com/250x350';
        poster.alt = drama.title || drama.name || 'Poster';
        poster.onerror = () => {
            poster.src = 'https://via.placeholder.com/250x350?text=Error';
        };
    }

    if (title) title.textContent = drama.title || drama.name || 'Tanpa Judul';
    if (year) year.textContent = drama.year || drama.release_date?.split('-')[0] || 'N/A';
    if (genre) genre.textContent = drama.genre || drama.genres?.join(', ') || 'N/A';
    if (description) description.textContent = drama.description || drama.overview || 'Deskripsi tidak tersedia';
    if (status) status.textContent = drama.status || 'Ongoing';
    if (episodeCount) episodeCount.textContent = currentEpisodes.length || '0';

    if (dramaDetail) dramaDetail.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
}

function displayEpisodes(episodes) {
    const episodesList = document.getElementById('episodesList');

    if (!episodesList) return;

    if (!episodes || episodes.length === 0) {
        episodesList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <h3>📭 Tidak ada episode</h3>
            </div>
        `;
        return;
    }

    episodesList.innerHTML = episodes.map((episode) => createEpisodeCard(episode)).join('');
}

function createEpisodeCard(episode) {
    const episodeNum = resolveEpisodeNumber(episode);
    const title = resolveEpisodeTitle(episode);

    return `
        <button class="episode-card" type="button" onclick='playEpisode(${JSON.stringify(episode)})'>
            <div class="episode-number">Ep ${episodeNum}</div>
            <div class="episode-title">${title}</div>
        </button>
    `;
}

function filterEpisodes() {
    const episodeFilter = document.getElementById('episodeFilter');
    const filterValue = episodeFilter.value.trim();

    if (!filterValue) {
        displayEpisodes(currentEpisodes);
        return;
    }

    const episodeNum = parseInt(filterValue, 10);
    if (Number.isNaN(episodeNum)) {
        showError('Masukkan nomor episode yang valid');
        return;
    }

    const filtered = currentEpisodes.filter((ep) => {
        const num = parseInt(resolveEpisodeNumber(ep), 10);
        return num === episodeNum;
    });

    if (filtered.length === 0) {
        document.getElementById('episodesList').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <h3>❌ Episode tidak ditemukan</h3>
            </div>
        `;
        return;
    }

    displayEpisodes(filtered);
}

function showError(message) {
    const detailLoader = document.getElementById('dramaDetailLoader');
    const dramaDetail = document.getElementById('dramaDetail');
    const errorState = document.getElementById('errorState');

    hideLoader(detailLoader);

    if (dramaDetail) dramaDetail.style.display = 'none';
    if (errorState) {
        errorState.style.display = 'block';
        document.getElementById('errorStateMessage').textContent = message;
    }
}

function playEpisode(episode) {
    const episodeNum = resolveEpisodeNumber(episode);
    const title = resolveEpisodeTitle(episode);
    const url = resolveEpisodeVideoUrl(episode);
    showPlayerSection(episodeNum, title, url);
}

function showPlayerSection(episodeNum, title, url) {
    const playerSection = document.getElementById('playerSection');
    const playerTitle = document.getElementById('playerTitle');
    const playerDescription = document.getElementById('playerDescription');
    const videoSource = document.getElementById('videoSource');
    const videoPlayer = document.getElementById('videoPlayer');

    if (!playerSection || !playerTitle || !videoSource || !videoPlayer) return;

    playerTitle.textContent = `Episode ${episodeNum} - ${title}`;

    if (url) {
        videoSource.src = url;
        videoPlayer.load();
        playerDescription.textContent = 'Selamat menonton!';
    } else {
        videoSource.src = '';
        videoPlayer.load();
        playerDescription.textContent = 'Link video episode ini tidak tersedia di API.';
    }

    playerSection.style.display = 'block';
    playerSection.scrollIntoView({ behavior: 'smooth' });
}

function closePlayer() {
    const playerSection = document.getElementById('playerSection');
    const videoSource = document.getElementById('videoSource');
    const videoPlayer = document.getElementById('videoPlayer');

    if (videoPlayer) {
        videoPlayer.pause();
    }

    if (videoSource) {
        videoSource.src = '';
    }

    if (videoPlayer) {
        videoPlayer.load();
    }

    if (playerSection) {
        playerSection.style.display = 'none';
    }
}
