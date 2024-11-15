// routes/search.js
const express = require('express');
const router = express.Router();
const { searchClubs, getSearchSuggestions } = require('../controllers/search');

router.get('/clubs', searchClubs);
router.get('/suggestions', getSearchSuggestions);

module.exports = router;