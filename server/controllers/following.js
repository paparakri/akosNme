const NormalUser = require('../models/normalUser');
const ClubUser = require('../models/clubUser');

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
        const FeedPost = new FeedPost({
            actor: {
                userId: userId,
                userType: 'normal',
                displayName: `${user.firstName} ${user.lastName}`,
                picturePath: user.picturePath
            },
            verb: 'followed_club',
            object: {
                targetId: clubId,
                targetType: 'club',
                content: club.displayName
            }
        });

        await Promise.all([user.save(), club.save(), FeedPost.save()]);

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