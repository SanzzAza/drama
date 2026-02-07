// API Configuration
const API_BASE_URL = '/api';
const API_TIMEOUT = 15000;

class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
        this.timeout = API_TIMEOUT;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...options.headers
                },
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Permintaan timeout. Silakan coba lagi.');
            }
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url);
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

// Initialize API Client
const apiClient = new APIClient();

// API Methods
const dramaAPI = {
    getLanguages: () => apiClient.get('/drama/languages'),
    
    getTrending: (lang = 6) => 
        apiClient.get('/drama/trending', { lang }),
    
    search: (query, lang = 6, page = 1) => 
        apiClient.get('/drama/search', { q: query, lang, page }),
    
    list: (lang = 6, page = 1) => 
        apiClient.get('/drama/list', { lang, page }),
    
    getDetail: (id, lang = 6) => 
        apiClient.get(`/drama/detail/${id}`, { lang })
};

// Error Handler
function handleAPIError(error) {
    console.error('API Error:', error);
    
    let message = 'Terjadi kesalahan. Silakan coba lagi.';
    
    if (error.message.includes('timeout')) {
        message = 'Koneksi timeout. Silakan coba lagi.';
    } else if (error.message.includes('Failed to fetch')) {
        message = 'Gagal terhubung ke server.';
    } else if (error.message.includes('HTTP Error')) {
        message = 'Server tidak merespons dengan baik.';
    } else {
        message = error.message;
    }
    
    return message;
}
