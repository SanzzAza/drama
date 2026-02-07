const { fetchFromFlickReels, formatResponse, sendJson } = require('../_lib/flickreels');

module.exports = async (req, res) => {
  try {
    const data = await fetchFromFlickReels('/languages');
    return sendJson(res, 200, formatResponse(true, 'Daftar bahasa berhasil diambil', data));
  } catch (error) {
    const status = error.status || 500;
    return sendJson(res, status, formatResponse(false, error.message || 'Gagal mengambil data bahasa'));
  }
};
