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


const extractDramaIdFromValue = (value) => {
  if (value === null || value === undefined) return null;

  const direct = Number.parseInt(value, 10);
  if (!Number.isNaN(direct) && direct > 0) return direct;
  if (typeof value !== 'string') return null;

  const patterns = [/\/drama\/(\d+)/i, /(?:^|[^\d])(\d{2,})(?:[^\d]|$)/];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match && match[1]) {
      const parsed = Number.parseInt(match[1], 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  return null;
};

const resolveDramaId = (drama) => {
  if (!drama || typeof drama !== 'object') return null;

  const keys = [
    'id', 'pk', 'drama_id', 'dramaId', 'id_drama', 'content_id', 'movie_id', 'vod_id',
    'url', 'link', 'detail_url', 'drama_url', 'path', 'share_url', 'web_url', 'redirect_url', 'deeplink', 'jump_url'
  ];

  for (const key of keys) {
    const resolved = extractDramaIdFromValue(drama[key]);
    if (resolved) return resolved;
  }

  for (const value of Object.values(drama)) {
    const resolved = extractDramaIdFromValue(value);
    if (resolved) return resolved;
  }

  return null;
};

const enrichDramasWithResolvedId = (dramas) => dramas.map((item) => {
  if (!item || typeof item !== 'object') return item;
  if (item.id && Number.parseInt(item.id, 10) > 0) return item;

  const resolvedId = resolveDramaId(item);
  return resolvedId ? { ...item, id: resolvedId } : item;
});

const normalizeListPayload = (payload) => {
  if (Array.isArray(payload)) return enrichDramasWithResolvedId(payload);
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload.data)) return enrichDramasWithResolvedId(payload.data);
  if (Array.isArray(payload.results)) return enrichDramasWithResolvedId(payload.results);
  if (Array.isArray(payload.items)) return enrichDramasWithResolvedId(payload.items);
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
  fetchFromFlickReels,
  resolveDramaId
};
