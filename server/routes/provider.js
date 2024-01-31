const express = require('express');
const router = express.Router();
const path = require('path');
const { getServiceProviderUser, createServiceProviderUser } = require('../controllers/providers.js');

router.route('/')
    .post(createServiceProviderUser);

router.route('/:user')
    .get(getServiceProviderUser);

router.route('/:user/followers')
    .get();

module.exports = router;