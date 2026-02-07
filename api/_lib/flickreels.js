const API_BASE_URL = 'https://aio-api.botraiki.biz/api/flickreels';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://aio-api.botraiki.biz/',
  Origin: 'https://aio-api.botraiki.biz'
};

const sendJson = (res, statusCode, payload) => {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.send(JSON.stringify(payload));
};

const formatResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return response;
};

const formatPagination = (currentPage, itemCount) => {
  const page = Number.parseInt(currentPage, 10) || 1;
  return {
    currentPage: page,
    nextPage: page + 1,
    previousPage: page > 1 ? page - 1 : null,
    hasMore: itemCount > 0,
    itemCount
  };
};

const normalizeListPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const normalizeDramaDetail = (payload) => {
  if (!payload || typeof payload !== 'object') return { drama: {}, episodes: [] };

  const drama = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const episodes = normalizeListPayload(drama.episodes || drama.episode_list || drama.list_episode || drama.list);

  return { drama, episodes };
};

const uiPageToApiPage = (uiPage) => {
  const safeUiPage = Number.parseInt(uiPage, 10) || 1;
  return Math.max(0, safeUiPage - 1);
};

const fetchFromFlickReels = async (path, params = {}) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: controller.signal
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const err = new Error(`Upstream error ${response.status}`);
      err.status = response.status;
      err.payload = data;
      throw err;
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  sendJson,
  formatResponse,
  formatPagination,
  normalizeListPayload,
  normalizeDramaDetail,
  uiPageToApiPage,
  fetchFromFlickReels
};
