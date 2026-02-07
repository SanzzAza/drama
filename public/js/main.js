// State Management
let currentPage = 1;
let searchCurrentPage = 1;
let isSearching = false;
let currentQuery = '';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const trendingList = document.getElementById('trendingList');
const trendingLoader = document.getElementById('trendingLoader');
const searchResults = document.getElementById('searchResults');
const searchLoader = document.getElementById('searchLoader');
const searchSection = document.getElementById('searchSection');
const trendingSection = document.getElementById('trendingSection');
const nextHomeSection = document.getElementById('nextHomeSection');
const nextHomeList = document.getElementById('nextHomeList');
const nextHomeLoader = document.getElementById('nextHomeLoader');

// Pagination Elements
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfoSpan = document.getElementById('pageInfo');

const prevPageHomeBtn = document.getElementById('prevPageHome');
const nextPageHomeBtn = document.getElementById('nextPageHome');
const pageInfoHomeSpan = document.getElementById('pageInfoHome');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTrending();
    loadNextHome();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Search Pagination
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (searchCurrentPage > 1) {
                searchCurrentPage--;
                performSearch();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            searchCurrentPage++;
            performSearch();
        });
    }

    // Next Home Pagination
    if (prevPageHomeBtn) {
        prevPageHomeBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadNextHome();
            }
        });
    }

    if (nextPageHomeBtn) {
        nextPageHomeBtn.addEventListener('click', () => {
            currentPage++;
            loadNextHome();
        });
    }

    // Back button for search
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', backToHome);
    }
}

// Load Trending Dramas
async function loadTrending() {
    try {
        showLoader(trendingLoader);
        const response = await dramaAPI.getTrending();
        
        if (response.success) {
            renderDramas(response.data.dramas, 'trendingList');
        } else {
            showErrorModal(response.message || 'Gagal memuat drama trending');
        }
    } catch (error) {
        const errorMessage = handleAPIError(error);
        showErrorModal(errorMessage);
    } finally {
        hideLoader(trendingLoader);
    }
}

// Load Next Home (Rekomendasi)
async function loadNextHome() {
    try {
        showLoader(nextHomeLoader);
        const response = await dramaAPI.list(6, currentPage);
        
        if (response.success) {
            renderDramas(response.data.dramas, 'nextHomeList');
            updatePaginationInfo(response.data.pagination, 'home');
        } else {
            showErrorModal(response.message || 'Gagal memuat rekomendasi');
        }
    } catch (error) {
        const errorMessage = handleAPIError(error);
        showErrorModal(errorMessage);
    } finally {
        hideLoader(nextHomeLoader);
    }
}

// Perform Search
async function performSearch() {
    const inputQuery = searchInput.value.trim();
    const query = isSearching && currentQuery ? currentQuery : inputQuery;
    
    if (!query) {
        showErrorModal('Masukkan kata kunci pencarian');
        return;
    }

    if (query.length < 2) {
        showErrorModal('Kata kunci minimal 2 karakter');
        return;
    }

    if (!isSearching || query !== currentQuery) {
        searchCurrentPage = 1;
    }

    currentQuery = query;
    searchInput.value = currentQuery;
    isSearching = true;

    try {
        showLoader(searchLoader);
        const response = await dramaAPI.search(query, 6, searchCurrentPage);
        
        if (response.success) {
            // Hide trending, show search
            trendingSection.style.display = 'none';
            nextHomeSection.style.display = 'none';
            searchSection.style.display = 'block';
            
            document.getElementById('searchQuery').textContent = `"${query}"`;
            renderDramas(response.data.dramas, 'searchResults');
            updatePaginationInfo(response.data.pagination, 'search');
            
            // Scroll to results
            if (searchCurrentPage === 1) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            showErrorModal(response.message || 'Pencarian gagal');
        }
    } catch (error) {
        const errorMessage = handleAPIError(error);
        showErrorModal(errorMessage);
    } finally {
        hideLoader(searchLoader);
    }
}

// Back to Home
function backToHome() {
    isSearching = false;
    currentQuery = '';
    searchInput.value = '';
    searchSection.style.display = 'none';
    trendingSection.style.display = 'block';
    nextHomeSection.style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update Pagination Info
function updatePaginationInfo(pagination, type = 'search') {
    if (type === 'search') {
        if (pageInfoSpan) {
            pageInfoSpan.textContent = `Halaman ${pagination.currentPage}`;
        }
        
        if (prevPageBtn) {
            prevPageBtn.disabled = pagination.currentPage <= 1;
        }
        
        if (nextPageBtn) {
            nextPageBtn.disabled = !pagination.hasMore;
        }
    } else if (type === 'home') {
        if (pageInfoHomeSpan) {
            pageInfoHomeSpan.textContent = `Halaman ${pagination.currentPage}`;
        }
        
        if (prevPageHomeBtn) {
            prevPageHomeBtn.disabled = pagination.currentPage <= 1;
        }
        
        if (nextPageHomeBtn) {
            nextPageHomeBtn.disabled = !pagination.hasMore;
        }
    }
}

// View Drama Detail
function viewDrama(dramaId) {
    if (!dramaId) {
        showErrorModal('ID Drama tidak valid');
        return;
    }
    
    window.location.href = `/public/drama-detail.html?id=${dramaId}`;
}
