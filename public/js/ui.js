// UI Utilities

// Show/Hide Loader
function showLoader(element) {
    if (element) {
        element.classList.add('show');
    }
}

function hideLoader(element) {
    if (element) {
        element.classList.remove('show');
    }
}

function extractDramaIdFromValue(value) {
    if (value === null || value === undefined) return null;

    const direct = Number.parseInt(value, 10);
    if (!Number.isNaN(direct) && direct > 0) {
        return direct;
    }

    if (typeof value !== 'string') return null;

    const patterns = [
        /\/drama\/(\d+)/i,
        /(?:^|[^\d])(\d{2,})(?:[^\d]|$)/
    ];

    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match && match[1]) {
            const parsed = Number.parseInt(match[1], 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                return parsed;
            }
        }
    }

    return null;
}

function resolveDramaId(drama) {
    const directCandidates = [
        drama?.id,
        drama?.pk,
        drama?.drama_id,
        drama?.dramaId,
        drama?.id_drama,
        drama?.content_id,
        drama?.movie_id,
        drama?.vod_id
    ];

    for (const value of directCandidates) {
        const resolved = extractDramaIdFromValue(value);
        if (resolved) return resolved;
    }

    const urlCandidates = [
        drama?.url,
        drama?.link,
        drama?.detail_url,
        drama?.drama_url,
        drama?.path,
        drama?.share_url,
        drama?.web_url,
        drama?.redirect_url,
        drama?.deeplink,
        drama?.jump_url
    ];

    for (const value of urlCandidates) {
        const resolved = extractDramaIdFromValue(value);
        if (resolved) return resolved;
    }

    // Last resort: scan all string fields in object
    for (const value of Object.values(drama || {})) {
        const resolved = extractDramaIdFromValue(value);
        if (resolved) return resolved;
    }

    return null;
}

// Drama Card Template
function createDramaCard(drama) {
    const title = drama.title || drama.name || 'Tanpa Judul';
    const poster = drama.poster_path || drama.poster || 'https://via.placeholder.com/180x270?text=No+Image';
    const year = drama.year || drama.release_date?.split('-')[0] || 'N/A';
    const id = resolveDramaId(drama);
    const actionLabel = id ? 'Lihat Detail →' : 'Detail tidak tersedia';
    const clickAction = id ? `viewDrama(${id})` : `showErrorModal('Detail drama tidak tersedia untuk item ini')`;

    return `
        <div class="drama-card" onclick="${clickAction}">
            <img src="${poster}" alt="${title}" class="drama-poster" onerror="this.src='https://via.placeholder.com/180x270?text=Error'">
            <div class="drama-card-overlay">
                <button class="drama-card-action">${actionLabel}</button>
            </div>
            <div class="drama-card-content">
                <h3 class="drama-title">${title}</h3>
                <div class="drama-rating">
                    <span>⭐</span>
                    <span>${drama.rating || 'N/A'}</span>
                </div>
                <p class="drama-year">${year}</p>
            </div>
        </div>
    `;
}

// Render Dramas Grid
function renderDramas(dramas, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!dramas || dramas.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <h3>📭 Tidak ada drama ditemukan</h3>
                <p>Coba cari dengan kata kunci lain</p>
            </div>
        `;
        return;
    }

    container.innerHTML = dramas.map(drama => createDramaCard(drama)).join('');
}

// Show Error Modal
function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');

    if (modal && errorMessage) {
        errorMessage.textContent = message;
        modal.style.display = 'flex';
    }
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking X
document.addEventListener('DOMContentLoaded', () => {
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeErrorModal);
    }

    // Close modal when clicking outside
    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
        window.addEventListener('click', (event) => {
            if (event.target === errorModal) {
                closeErrorModal();
            }
        });
    }
});

// Format Number
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Truncate Text
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Generate Stars
function generateStars(rating) {
    const stars = Math.round(rating / 2);
    return '⭐'.repeat(Math.min(stars, 5));
}
