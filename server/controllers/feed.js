// controllers/feed.js
const NormalUser = require('../models/normalUser');
const ClubUser = require('../models/clubUser');
const Review = require('../models/review');
const Event = require('../models/event');
const Reservation = require('../models/reservation');

const getFeed = async (req, res) => {
    try {
        const userId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Verify user exists
        const user = await NormalUser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get user's followed clubs and service providers
        const followedClubs = user.clubInterests || [];
        const followedProviders = user.serviceProviderInterests || [];

        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch different types of activities
        const [reviews, reservations, events] = await Promise.all([
            // Recent reviews from followed clubs
            Review.find({
                club: { $in: followedClubs },
                createdAt: { $gte: thirtyDaysAgo }
            }).populate('user', 'username displayName picturePath')
              .populate('club', 'username displayName')
              .sort({ createdAt: -1 })
              .limit(limit),

            // User's recent reservations
            Reservation.find({
                user: userId,
                createdAt: { $gte: thirtyDaysAgo }
            }).populate('club', 'username displayName')
              .sort({ createdAt: -1 })
              .limit(limit),

            // Upcoming events from followed clubs
            Event.find({
                club: { $in: followedClubs },
                date: { $gte: new Date() }
            }).populate('club', 'username displayName')
              .sort({ date: 1 })
              .limit(limit)
        ]);

        // Transform activities into feed items
        const feedItems = [
            // Transform reviews
            ...reviews.map(review => ({
                _id: review._id,
                actor: {
                    userId: review.user._id,
                    userType: 'normal',
                    displayName: review.user.displayName,
                    picturePath: review.user.picturePath
                },
                verb: 'posted_review',
                object: {
                    targetId: review.club._id,
                    targetType: 'club',
                    content: {
                        reviewText: review.reviewText,
                        rating: review.rating,
                        clubName: review.club.displayName,
                        clubUsername: review.club.username
                    }
                },
                createdAt: review.createdAt
            })),

            // Transform reservations
            ...reservations.map(reservation => ({
                _id: reservation._id,
                actor: {
                    userId: user._id,
                    userType: 'normal',
                    displayName: user.displayName,
                    picturePath: user.picturePath
                },
                verb: 'made_reservation',
                object: {
                    targetId: reservation.club._id,
                    targetType: 'club',
                    content: {
                        date: reservation.date,
                        clubName: reservation.club.displayName,
                        clubUsername: reservation.club.username,
                        specialRequests: reservation.specialRequests
                    }
                },
                createdAt: reservation.createdAt
            })),

            // Transform events
            ...events.map(event => ({
                _id: event._id,
                actor: {
                    userId: event.club._id,
                    userType: 'club',
                    displayName: event.club.displayName
                },
                verb: 'upcoming_event',
                object: {
                    targetId: event._id,
                    targetType: 'event',
                    content: {
                        eventName: event.name,
                        description: event.description,
                        date: event.date,
                        clubName: event.club.displayName,
                        clubUsername: event.club.username
                    }
                },
                createdAt: event.createdAt
            }))
        ];

        // Sort combined activities by creation date
        const sortedFeed = feedItems.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Paginate results
        const paginatedFeed = sortedFeed.slice(skip, skip + limit);

        res.status(200).json({
            feed: paginatedFeed,
            hasMore: sortedFeed.length > skip + limit,
            nextPage: page + 1
        });

    } catch (error) {
        console.log('Feed error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFeed };