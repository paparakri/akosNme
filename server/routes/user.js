const express = require('express');
const router = express.Router();
const path = require('path');
const verifyToken = require('../middleware/auth.js');
const { getUserRecs } = require('../controllers/recs');
const { addReview, getReviews , updateReview, removeReview } = require('../controllers/reviews');
const { 
    getNormalUser, 
    getNormalUserByName, 
    createNormalUser, 
    getNormalUserClubInterests, 
    getNormalUserServiceProviderInterests, 
    addRemoveInterest, 
    updateNormalUser, 
    deleteNormalUser
} = require('../controllers/users');
const { getReservations }  = require('../controllers/reservations.js');

router.route('/:id')
    .get(getNormalUser)
    .put(updateNormalUser)
    .delete(deleteNormalUser);


router.route('/:user/byName')
    .get(getNormalUserByName)

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
    .post(addReview)
    .put(updateReview)
    .delete(removeReview);

router.route('/:id/reservations')
    .get(getReservations);

module.exports = router;