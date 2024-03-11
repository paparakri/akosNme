const express = require('express');
const router = express.Router();
const path = require('path');
const verifyToken = require('../middleware/auth.js');
const { getUserRecs } = require('../controllers/recs');
const { addRemoveReview, getReviews , updateReview, deleteReview } = require('../controllers/reviews');
const { getNormalUser, createNormalUser, getNormalUserClubInterests, getNormalUserServiceProviderInterests, addRemoveInterest, updateNormalUser, deleteNormalUser } = require('../controllers/users');

router.route('/:id')
    .get(verifyToken, getNormalUser)
    .put(verifyToken, updateNormalUser)
    .delete(verifyToken, deleteNormalUser);

router.route('/:id/recs')
    .get(getUserRecs);

//Replace with the register route & controller in different routes file
router.route('/')
    .post(createNormalUser);

router.route('/:id/clubs')
    .get(getNormalUserClubInterests);

router.route('/:id/artists')
    .get(getNormalUserServiceProviderInterests);

router.route('/:id/add')
    .put(addRemoveInterest);

router.route('/:id/reviews')
    .get(getReviews)
    .post(addRemoveReview)
    .put(updateReview)
    .delete(deleteReview);

module.exports = router;