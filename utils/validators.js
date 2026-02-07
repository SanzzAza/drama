const validateLanguage = (req, res, next) => {
  const { lang } = req.query;
  
  if (lang && isNaN(lang)) {
    return res.status(400).json({
      success: false,
      message: 'Parameter lang harus berupa angka'
    });
  }
  
  next();
};

const validatePagination = (req, res, next) => {
  const { page } = req.query;
  
  if (page && isNaN(page)) {
    return res.status(400).json({
      success: false,
      message: 'Parameter page harus berupa angka'
    });
  }
  
  const pageNum = parseInt(page) || 1;
  if (pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Halaman harus dimulai dari 1'
    });
  }
  
  next();
};

const validateSearch = (req, res, next) => {
  const { q } = req.query;
  
  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Query pencarian tidak boleh kosong'
    });
  }
  
  if (q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Query pencarian minimal 2 karakter'
    });
  }
  
  next();
};

module.exports = {
  validateLanguage,
  validatePagination,
  validateSearch
};
