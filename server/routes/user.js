const express = require('express');
const router = express.Router();
const path = require('path');
const { addRemoveReview } = require('../controllers/reviews');
const { getNormalUser, createNormalUser, getNormalUserClubInterests, getNormalUserServiceProviderInterests, addRemoveInterest, updateNormalUser, deleteNormalUser } = require('../controllers/users');

router.route('/:id')
    .get(getNormalUser)
    .put(updateNormalUser)
    .delete(deleteNormalUser)
    .post(addRemoveReview);
router.route('/')
    .post(createNormalUser);
router.route('/:id/clubs')
    .get(getNormalUserClubInterests);
router.route('/:id/artists')
    .get(getNormalUserServiceProviderInterests);
router.route('/:id/add')
    .put(addRemoveInterest);

module.exports = router;