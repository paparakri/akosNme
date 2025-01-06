const FeedPost = require('../models/feedPost');
const User = require('../models/normalUser');
const Club = require('../models/clubUser');

class FeedService {
  // Create a new feed post for an event
  async createEventPost(
    clubId,
    eventId,
    eventName,
    eventDate,
    eventDescription
  ) {
    try {
      const club = await Club.findById(clubId);
      if (!club) throw new Error('Club not found');

      const post = new FeedPost({
        postType: 'event',
        actor: club._id,  // In this case, club is the actor
        club: club._id,
        metadata: {
          eventId,
          eventName,
          eventDate,
          eventDescription
        }
      });

      await post.save();
      return post;
    } catch (error) {
      console.error('Error creating event post:', error);
      throw error;
    }
  }

  // Create a new feed post for a reservation
  async createReservationPost(
    userId,
    clubId,
    reservationId,
    reservationDate,
    guestCount,
    tableNumber = null
  ) {
    try {
      console.log(`Trying to create reservation post with info: userId=${userId}, clubId=${clubId}, reservationId=${reservationId}, date=${reservationDate}, guests=${guestCount}, table=${tableNumber}`);
      
      // Convert date string to Date object
      console.log("!!!!!!!!!!Reservation date: ", reservationDate)
      const parsedDate = new Date(reservationDate.split('-').reverse().join('/'));
      console.log("!!!!!!!!!!Parsed date: ", parsedDate);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const [user, club] = await Promise.all([
        User.findById(userId),
        Club.findById(clubId)
      ]);

      if (!user || !club) throw new Error('User or Club not found');

      const post = new FeedPost({
        postType: 'reservation',
        actor: user._id,
        club: club._id,
        metadata: {
          reservationId,
          reservationDate: parsedDate, // Use the parsed date
          guestCount,
          tableNumber
        }
      });

      await post.save();
      return post;
    } catch (error) {
      console.error('Error creating reservation post:', error);
      throw error;
    }
  }

  // Create a new feed post for a review
  async createReviewPost(
    userId,
    clubId,
    reviewId,
    rating,
    reviewText
  ) {
    try {
      const [user, club] = await Promise.all([
        User.findById(userId),
        Club.findById(clubId)
      ]);

      if (!user || !club) throw new Error('User or Club not found');

      const post = new FeedPost({
        postType: 'review',
        actor: user._id,
        club: club._id,
        metadata: {
          reviewId,
          rating,
          reviewText
        }
      });

      await post.save();
      return post;
    } catch (error) {
      console.error('Error creating review post:', error);
      throw error;
    }
  }

  // Get feed posts for a user
  async getFeedPosts(options) {
    try {
      const {
        page = 1,
        limit = 20,
        userId,
        includeClubs = true,
        includeFriends = true
      } = options;

      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get user's friends and followed clubs
      const followedClubs = user.clubInterests || [];
      const friends = user.friends || [];

      // Build query conditions
      const conditions = [];
      
      if (includeClubs) {
        conditions.push({
          club: { $in: followedClubs },
          postType: 'event'
        });
      }

      if (includeFriends) {
        conditions.push({
          actor: { $in: friends },
          postType: { $in: ['reservation', 'review'] }
        });
      }

      // Execute query with pagination
      const posts = await FeedPost.find(conditions.length > 0 ? { $or: conditions } : {})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actor', 'username firstName lastName')
        .populate('club', 'username displayName')
        .lean();

      // Group similar posts
      const groupedPosts = this.groupSimilarPosts(posts);

      return groupedPosts;
    } catch (error) {
      console.error('Error fetching feed posts:', error);
      throw error;
    }
  }

  // Helper method to group similar posts
  groupSimilarPosts(posts) {
    const grouped = posts.reduce((acc, post) => {
      // Check if there's a recent similar post
      const similarPost = acc.find(p => 
        p.postType === post.postType &&
        p.club._id.toString() === post.club._id.toString() &&
        new Date(p.createdAt).getTime() > new Date(post.createdAt).getTime() - 3600000 // 1 hour window
      );

      if (similarPost) {
        // Add to grouped posts
        if (!similarPost.groupedPosts) {
          similarPost.groupedPosts = [];
        }
        similarPost.groupedPosts.push(post);
      } else {
        // Create new group
        acc.push(post);
      }

      return acc;
    }, []);

    return grouped;
  }
}

module.exports = new FeedService();