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
const FeedPost = require('../models/feedPost.js');
const Event = require('../models/event.js');
const User = require('../models/normalUser.js');

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
  router.get('/feed/:user', async (req, res) => {
    try {
      console.log("Inside Feed Route");
      const id = req.params.user;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const posts = await getFeedPosts(id, skip, limit);

      // Group similar posts
      /*const groupedPosts = posts.reduce((acc, post) => {
        const similarPost = acc.find(p => 
          p.postType === post.postType &&
          p.club._id.toString() === post.club._id.toString() &&
          new Date(p.createdAt).getTime() > new Date(post.createdAt).getTime() - 3600000
        );

        if (similarPost) {
          if (!similarPost.groupedPosts) {
            similarPost.groupedPosts = [];
          }
          similarPost.groupedPosts.push(post);
        } else {
          acc.push(post);
        }

        return acc;
      }, []);*/

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

  // Get user's feed posts
  router.get('/feed/actor/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const posts = await FeedPost.find({ actor: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'username firstName lastName')
        .populate('club', 'username displayName address')
        .lean();

      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      console.error('Error in GET /feed/:userId:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user feed posts'
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


//--------------------------HELPER FUNCTION---------------------------
// Get feed posts with proper population of actor (NormalUser or ClubUser)
const getFeedPosts = async (id, skip = 0, limit = 10) => {
  try {
    const userObj = await User.findById(id);
    const friends = userObj.friends;
    const followedClubs = userObj.clubInterests;
    const posts = [];

    for(let i=0; i<friends.length; i++){
      const rawPosts = await FeedPost.find({actor: friends[i]})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      // First try to populate assuming actor is NormalUser
      .populate(
        'actor',
        'username firstName lastName picturePath',
        'NormalUser'
      )
      // Also populate club reference
      .populate(
        'club',
        'username displayName images address',
        'ClubUser'
      )
      .lean();

      posts.push(...rawPosts);
    }

    for(let i=0; i<followedClubs.length; i++){
      const rawPosts = await FeedPost.find({actor: followedClubs[i]})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      // First try to populate assuming actor is NormalUser
      .populate(
        'actor',
        'username firstName lastName picturePath',
        'NormalUser'
      )
      // Also populate club reference
      .populate(
        'club',
        'username displayName images address',
        'ClubUser'
      )
      .lean();

      posts.push(...rawPosts);
    }

    // For any posts where actor wasn't populated (null), try populating as ClubUser
    const populatedPosts = await Promise.all(posts.map(async (post) => {
      if (!post.actor) {
        // If actor is null, try populating as ClubUser
        const populatedPost = await FeedPost.findById(post._id)
          .populate(
            'actor',
            'username displayName images address',
            'ClubUser'
          )
          .lean();
        return populatedPost;
      }
      return post;
    }));

    // Additional population for event/reservation/review metadata if needed
    const fullyPopulatedPosts = await Promise.all(populatedPosts.map(async (post) => {
      if (post.postType === 'event' && post.metadata.eventId) {
        const event = await Event.findById(post.metadata.eventId)
          .select('name description date images')
          .lean();
        post.metadata.eventDetails = event;
      }
      return post;
    }));

    return fullyPopulatedPosts;
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    throw error;
  }
};

module.exports = router;