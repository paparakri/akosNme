const NormalUser = require('../models/normalUser');
const ClubUser = require('../models/clubUser');
const FeedPost = require('../models/feedPost');

// Follow a club
const followClub = async (req, res) => {
    try {
        const userId = req.params.id;
        const clubId = req.params.clubId;
        
        const [user, club] = await Promise.all([
            NormalUser.findById(userId),
            ClubUser.findById(clubId)
        ]);

        if (!user || !club) {
            return res.status(404).json({ error: "User or club not found" });
        }

        // Check if already following
        if (user.clubInterests.includes(clubId)) {
            return res.status(400).json({ error: "Already following this club" });
        }

        // Add to following/followers lists
        user.clubInterests.push(clubId);
        club.followers.push(userId);

        // Create feed item for the follow action
        const feedPost = new FeedPost({
            postType: 'event', // Required field - you might want to create a new type for follows
            actor: userId,     // Just pass the ObjectId directly
            club: clubId,      // Required field
            metadata: {
                eventName: `${user.firstName} ${user.lastName} followed ${club.displayName}`,
                eventDescription: `New club follow activity`,
                eventDate: new Date()
            }
        });

        await Promise.all([user.save(), club.save(), feedPost.save()]);

        res.status(200).json({
            message: "Successfully followed club",
            clubInterests: user.clubInterests
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Unfollow a club
const unfollowClub = async (req, res) => {
    try {
        const userId = req.params.id;
        const clubId = req.params.clubId;

        const [user, club] = await Promise.all([
            NormalUser.findById(userId),
            ClubUser.findById(clubId)
        ]);

        if (!user || !club) {
            return res.status(404).json({ error: "User or club not found" });
        }

        // Remove from following/followers lists
        user.clubInterests = user.clubInterests.filter(id => id.toString() !== clubId);
        club.followers = club.followers.filter(id => id.toString() !== userId);

        await Promise.all([user.save(), club.save()]);

        res.status(200).json({ 
            message: "Successfully unfollowed club",
            clubInterests: user.clubInterests 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    followClub,
    unfollowClub
};