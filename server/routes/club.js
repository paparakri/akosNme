const express = require('express');
const router = express.Router();
const path = require('path');
const { getClubUser, createClubUser, getFollowers, addRemoveInterest, getInterests, updateClubUser, deleteClubUser } = require('../controllers/clubs');

router.route('/')
    .post(createClubUser);

router.route('/:user')
    .get(getClubUser)
    .put(updateClubUser)
    .delete(deleteClubUser);

router.route('/:user/followers')
    .get(getFollowers);

router.route('/:user/interests')
    .get(getInterests);

router.route('/:user/add')
    .put(addRemoveInterest);

module.exports = router;