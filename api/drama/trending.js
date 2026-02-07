const { fetchFromFlickReels, formatResponse, normalizeListPayload, sendJson } = require('../_lib/flickreels');

module.exports = async (req, res) => {
  try {
    const lang = req.query.lang || 6;
    const data = await fetchFromFlickReels('/trending', { lang });
    const dramas = normalizeListPayload(data);

    return sendJson(
      res,
      200,
      formatResponse(true, 'Drama trending berhasil diambil', {
        dramas,
        total: data?.total || dramas.length
      })
    );
  } catch (error) {
    const status = error.status || 500;
    return sendJson(res, status, formatResponse(false, error.message || 'Gagal mengambil data trending'));
  }
};
