const apiClient = require('../utils/api-client');
const { formatResponse, formatPagination } = require('../utils/response-formatter');

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

const normalizeListPayload = (payload) => {
  const enrich = (list) => list.map((item) => {
    if (!item || typeof item !== 'object') return item;
    if (item.id && Number.parseInt(item.id, 10) > 0) return item;

    const resolvedId = resolveDramaId(item);
    return resolvedId ? { ...item, id: resolvedId } : item;
  });

  if (Array.isArray(payload)) return enrich(payload);
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload.data)) return enrich(payload.data);
  if (Array.isArray(payload.results)) return enrich(payload.results);
  if (Array.isArray(payload.items)) return enrich(payload.items);
  return [];
};

const normalizeDramaDetail = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { drama: {}, episodes: [] };
  }

  const drama = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const episodes = normalizeListPayload(drama.episodes || drama.episode_list || drama.list_episode || drama.list);

  return { drama, episodes };
};

const getApiPage = (uiPage) => {
  const safeUiPage = Number.parseInt(uiPage, 10) || 1;
  return Math.max(0, safeUiPage - 1);
};

exports.getLanguages = async (req, res, next) => {
  try {
    const response = await apiClient.get('/languages');
    res.json(formatResponse(true, 'Daftar bahasa berhasil diambil', response.data));
  } catch (error) {
    next(error);
  }
};

exports.getTrending = async (req, res, next) => {
  try {
    const { lang = 6 } = req.query;
    const response = await apiClient.get('/trending', {
      params: { lang }
    });
    
    const dramas = normalizeListPayload(response.data);
    const formattedData = {
      dramas,
      total: response.data?.total || dramas.length
    };
    
    res.json(formatResponse(true, 'Drama trending berhasil diambil', formattedData));
  } catch (error) {
    next(error);
  }
};

exports.searchDramas = async (req, res, next) => {
  try {
    const { q, lang = 6, page = 1 } = req.query;
    const apiPage = getApiPage(page);
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json(formatResponse(false, 'Query pencarian tidak boleh kosong'));
    }

    const response = await apiClient.get('/search', {
      params: { 
        q: q.trim(), 
        lang,
        page: apiPage
      }
    });
    
    const dramas = normalizeListPayload(response.data);
    const pagination = formatPagination(page, dramas.length);
    
    res.json(formatResponse(true, 'Pencarian drama berhasil', {
      dramas,
      pagination,
      query: q,
      apiPage
    }));
  } catch (error) {
    next(error);
  }
};

exports.listDramas = async (req, res, next) => {
  try {
    const { lang = 6, page = 1 } = req.query;
    const apiPage = getApiPage(page);
    
    const response = await apiClient.get('/nexthome', {
      params: { 
        lang,
        page: apiPage
      }
    });
    
    const dramas = normalizeListPayload(response.data);
    const pagination = formatPagination(page, dramas.length);
    
    res.json(formatResponse(true, 'Daftar drama berhasil diambil', {
      dramas,
      pagination,
      apiPage
    }));
  } catch (error) {
    next(error);
  }
};

exports.getDramaDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 6 } = req.query;
    
    if (!id || isNaN(id)) {
      return res.status(400).json(formatResponse(false, 'ID drama tidak valid'));
    }

    const response = await apiClient.get(`/drama/${id}`, {
      params: { lang }
    });
    
    const { drama, episodes } = normalizeDramaDetail(response.data);
    
    res.json(formatResponse(true, 'Detail drama berhasil diambil', {
      drama,
      episodes
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
