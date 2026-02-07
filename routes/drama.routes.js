const express = require('express');
const router = express.Router();
const dramaController = require('../controllers/drama.controller');
const { validatePagination, validateSearch, validateLanguage } = require('../utils/validators');

// Languages
router.get('/drama/languages', dramaController.getLanguages);

// Trending dramas
router.get('/drama/trending', validateLanguage, dramaController.getTrending);

// Search dramas dengan pagination
router.get('/drama/search', validateLanguage, validateSearch, dramaController.searchDramas);

// List dramas dengan pagination
router.get('/drama/list', validateLanguage, validatePagination, dramaController.listDramas);

// Detail drama dan episodes
router.get('/drama/detail/:id', validateLanguage, dramaController.getDramaDetail);

module.exports = router;
