const express = require('express');
const router = express.Router();
const path = require('path');
const { register, login, loginClub } = require('../controllers/auth.js');
const { getReviewById } = require('../controllers/reviews');
const { addReservation, removeReservation } = require('../controllers/reservations');

router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
});

router.get('/artists(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views' , 'artists.html'));
});

router.route('/review/:id')
    .get(getReviewById);

router.route('/reservations')
    .post(addReservation)
    .delete(removeReservation);

router.route('/ClubLogin')
    .post(loginClub);

router.route('/UserLogin')
    .post(login);

router.route('/UserRegister')
    .post(register);

module.exports = router;