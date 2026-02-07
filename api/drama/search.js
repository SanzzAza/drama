const {
  fetchFromFlickReels,
  formatPagination,
  formatResponse,
  normalizeListPayload,
  sendJson,
  uiPageToApiPage
} = require('../_lib/flickreels');

module.exports = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    const lang = req.query.lang || 6;
    const page = req.query.page || 1;

    if (!q) {
      return sendJson(res, 400, formatResponse(false, 'Query pencarian tidak boleh kosong'));
    }

    const apiPage = uiPageToApiPage(page);
    const data = await fetchFromFlickReels('/search', { q, lang, page: apiPage });
    const dramas = normalizeListPayload(data);

    return sendJson(
      res,
      200,
      formatResponse(true, 'Pencarian drama berhasil', {
        dramas,
        pagination: formatPagination(page, dramas.length),
        query: q,
        apiPage
      })
    );
  } catch (error) {
    const status = error.status || 500;
    return sendJson(res, status, formatResponse(false, error.message || 'Gagal mencari drama'));
  }
};
