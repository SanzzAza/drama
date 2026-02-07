const axios = require('axios');

const baseURL = process.env.API_BASE_URL || 'https://aio-api.botraiki.biz/api/flickreels';

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Content-Type': 'application/json',
    'Referer': 'https://aio-api.botraiki.biz/',
    'Origin': 'https://aio-api.botraiki.biz'
  }
});

// Interceptor untuk error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return Promise.reject(new Error('Data tidak ditemukan'));
      } else if (status === 429) {
        return Promise.reject(new Error('Terlalu banyak permintaan, coba lagi nanti'));
      } else if (status >= 500) {
        return Promise.reject(new Error('Server error, silakan coba lagi'));
      }
    } else if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Koneksi timeout'));
    }
    return Promise.reject(error);
  }
);

module.exports = apiClient;
