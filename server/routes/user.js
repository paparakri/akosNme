const express = require('express');
const router = express.Router();
const path = require('path');
const { getNormalUser, createNormalUser, getNormalUserClubInterests, getNormalUserServiceProviderInterests, addRemoveInterest, updateNormalUser, deleteNormalUser } = require('../controllers/users');

router.route('/:id')
    .get(getNormalUser)
    .put(updateNormalUser)
    .delete(deleteNormalUser);
  //.post((req,res) => {console.log("POST request to /user/:id || use for adding review maybe?")});
router.route('/')
    .post(createNormalUser);
router.route('/:id/clubs')
    .get(getNormalUserClubInterests);
router.route('/:id/artists')
    .get(getNormalUserServiceProviderInterests);
router.route('/:id/add')
    .put(addRemoveInterest);

module.exports = router;