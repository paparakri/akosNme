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
const { 
    getFriends, 
    getFriendRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend,
} = require('../controllers/friends');
const { followClub, unfollowClub } = require('../controllers/following');

// Friend-related routes
router.route('/:id/friends')
    .get(getFriends);

router.route('/:id/friends/requests')
    .get(getFriendRequests);

router.route('/:id/friends/request/:secondUserId')
    .post(sendFriendRequest);

router.route('/:id/friends/accept/:requestId')
    .put(acceptFriendRequest);

router.route('/:id/friends/reject/:requestId')
    .put(rejectFriendRequest);

router.route('/:id/friends/:friendId')
    .delete(removeFriend);

// Following-related routes
router.route('/:id/following/clubs/:clubId')
    .post(followClub)
    .delete(unfollowClub);

//FEED---------------------------------

router.get('/feed', async (req, res) => {
    try {
      const userId = req.user?.id;  // From auth middleware
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const includeClubs = req.query.includeClubs !== 'false';
      const includeFriends = req.query.includeFriends !== 'false';
  
      const posts = await feedService.getFeedPosts({
        userId,
        page,
        limit,
        includeClubs,
        includeFriends
      });
  
      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      console.error('Error in GET /feed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feed posts'
      });
    }
  });
  
  // Create event post (typically called from event creation endpoint)
  router.post('/feed/event', async (req, res) => {
    try {
      const { clubId, eventId, eventName, eventDate, eventDescription } = req.body;
  
      // Validate required fields
      if (!clubId || !eventId || !eventName || !eventDate) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
  
      const post = await feedService.createEventPost(
        clubId,
        eventId,
        eventName,
        new Date(eventDate),
        eventDescription
      );
  
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error in POST /feed/event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create event post'
      });
    }
  });
  
  // Create reservation post (typically called from reservation creation endpoint)
  router.post('/feed/reservation', async (req, res) => {
    try {
      const {
        userId,
        clubId,
        reservationId,
        reservationDate,
        guestCount,
        tableNumber
      } = req.body;
  
      // Validate required fields
      if (!userId || !clubId || !reservationId || !reservationDate || !guestCount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
  
      const post = await feedService.createReservationPost(
        userId,
        clubId,
        reservationId,
        new Date(reservationDate),
        guestCount,
        tableNumber
      );
  
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error in POST /feed/reservation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create reservation post'
      });
    }
  });
  
  // Create review post (typically called from review creation endpoint)
  router.post('/feed/review', async (req, res) => {
    try {
      const {
        userId,
        clubId,
        reviewId,
        rating,
        reviewText
      } = req.body;
  
      // Validate required fields
      if (!userId || !clubId || !reviewId || !rating) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
  
      const post = await feedService.createReviewPost(
        userId,
        clubId,
        reviewId,
        rating,
        reviewText
      );
  
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error in POST /feed/review:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create review post'
      });
    }
  });

//-------------------------------------

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