const { fetchFromFlickReels, formatResponse, normalizeDramaDetail, sendJson } = require('../../_lib/flickreels');

module.exports = async (req, res) => {
  try {
    const id = req.query.id;
    const lang = req.query.lang || 6;

    if (!id || Number.isNaN(Number(id))) {
      return sendJson(res, 400, formatResponse(false, 'ID drama tidak valid'));
    }

    const data = await fetchFromFlickReels(`/drama/${id}`, { lang });
    const { drama, episodes } = normalizeDramaDetail(data);

    return sendJson(res, 200, formatResponse(true, 'Detail drama berhasil diambil', { drama, episodes }));
  } catch (error) {
    const status = error.status || 500;
    return sendJson(res, status, formatResponse(false, error.message || 'Gagal mengambil detail drama'));
  }
};
