const apiClient = require('../utils/api-client');
const { formatResponse, formatPagination } = require('../utils/response-formatter');

const normalizeListPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.items)) return payload.items;
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
