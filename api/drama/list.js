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
    const lang = req.query.lang || 6;
    const page = req.query.page || 1;
    const apiPage = uiPageToApiPage(page);

    const data = await fetchFromFlickReels('/nexthome', { lang, page: apiPage });
    const dramas = normalizeListPayload(data);

    return sendJson(
      res,
      200,
      formatResponse(true, 'Daftar drama berhasil diambil', {
        dramas,
        pagination: formatPagination(page, dramas.length),
        apiPage
      })
    );
  } catch (error) {
    const status = error.status || 500;
    return sendJson(res, status, formatResponse(false, error.message || 'Gagal mengambil daftar drama'));
  }
};
