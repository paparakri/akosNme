const NormalUser = require('../models/normalUser');

// Get all friends of a user
const getFriends = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await NormalUser.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get detailed friend information
        const friends = await Promise.all(
            user.friends.map((friendId) => NormalUser.findById(friendId))
        );

        // Format the response to only include necessary fields
        const formattedFriends = friends.map(friend => ({
            _id: friend._id,
            username: friend.username,
            firstName: friend.firstName,
            lastName: friend.lastName,
            picturePath: friend.picturePath
        }));

        res.status(200).json(formattedFriends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all friend requests for a user
const getFriendRequests = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await NormalUser.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get detailed request information
        const requests = await Promise.all(
            user.friendRequests.map((requestId) => NormalUser.findById(requestId))
        );

        const formattedRequests = requests.map(requester => ({
            _id: requester._id,
            username: requester.username,
            firstName: requester.firstName,
            lastName: requester.lastName,
            picturePath: requester.picturePath
        }));

        res.status(200).json(formattedRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send a friend request
const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.params.id;
        const receiverId = req.params.secondUserId;

        // Check if users exist
        const [sender, receiver] = await Promise.all([
            NormalUser.findById(senderId),
            NormalUser.findById(receiverId)
        ]);

        if (!sender || !receiver) {
            return res.status(404).json({ error: "One or both users not found" });
        }

        // Check if already friends
        if (sender.friends.includes(receiverId)) {
            return res.status(400).json({ error: "Already friends" });
        }

        // Check if request already sent
        if (receiver.friendRequests.includes(senderId) || 
            sender.sentFriendRequests.includes(receiverId)) {
            return res.status(400).json({ error: "Friend request already sent" });
        }

        // Add request to both users
        receiver.friendRequests.push(senderId);
        sender.sentFriendRequests.push(receiverId);

        await Promise.all([receiver.save(), sender.save()]);

        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Accept a friend request
const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.params.id;
        const requesterId = req.params.requestId;

        const [user, requester] = await Promise.all([
            NormalUser.findById(userId),
            NormalUser.findById(requesterId)
        ]);

        if (!user || !requester) {
            return res.status(404).json({ error: "One or both users not found" });
        }

        // Verify request exists
        if (!user.friendRequests.includes(requesterId)) {
            return res.status(400).json({ error: "Friend request not found" });
        }

        // Add each user to the other's friends list
        user.friends.push(requesterId);
        requester.friends.push(userId);

        // Remove request from both users
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
        requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id.toString() !== userId);

        await Promise.all([user.save(), requester.save()]);

        res.status(200).json({ message: "Friend request accepted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reject a friend request
const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.params.id;
        const requesterId = req.params.requestId;

        const [user, requester] = await Promise.all([
            NormalUser.findById(userId),
            NormalUser.findById(requesterId)
        ]);

        if (!user || !requester) {
            return res.status(404).json({ error: "One or both users not found" });
        }

        // Remove request from both users
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
        requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id.toString() !== userId);

        await Promise.all([user.save(), requester.save()]);

        res.status(200).json({ message: "Friend request rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove a friend
const removeFriend = async (req, res) => {
    try {
        const userId = req.params.id;
        const friendId = req.params.friendId;

        const [user, friend] = await Promise.all([
            NormalUser.findById(userId),
            NormalUser.findById(friendId)
        ]);

        if (!user || !friend) {
            return res.status(404).json({ error: "One or both users not found" });
        }

        // Remove each user from the other's friends list
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        await Promise.all([user.save(), friend.save()]);

        res.status(200).json({ message: "Friend removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
};