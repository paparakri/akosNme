const express = require('express');
const router = express.Router();
const path = require('path');
const { getEvents, postEvent, updateEvent, deleteEvent } = require('../controllers/events');
const { saveLayout, getClubUser, getClubUserByName, createClubUser, getFollowers, addRemoveInterest, getInterests, updateClubUser, deleteClubUser } = require('../controllers/clubs');
const { updateAllClubs } = require("../config/updateAllUsers.js");
const { getClubReservations, getClubReservationsByDate } = require('../controllers/reservations');
const { getRangeAvailability } = require('../controllers/availability');
const { reservationStream } = require('../controllers/sseControl');

router.route('/update-all')
    .post(updateAllClubs);

router.route('/')
    .post(createClubUser);

router.route('/:user')
    .get(getClubUser)
    .put(updateClubUser)
    .delete(deleteClubUser);

router.route('/:user/byName')
    .get(getClubUserByName);

router.route('/:user/events')
    .get(getEvents)
    .post(postEvent)
    .put(updateEvent)
    .delete(deleteEvent);

router.route('/:user/followers')
    .get(getFollowers);

router.route('/:user/interests')
    .get(getInterests);

router.route('/:user/add')
    .put(addRemoveInterest);

router.route('/:user/save-layout')
    .post(saveLayout);

router.route('/:user/reservations')
    .get(getClubReservations);

router.route('/:user/reservations/:date')
    .get(getClubReservationsByDate);

router.route('/:user/availability')
    .get(getRangeAvailability);

router.route('/:user/reservations/stream')
    .get(reservationStream);

module.exports = router;