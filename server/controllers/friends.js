const NormalUser = require('../models/normalUser');
const FriendRequest = require('../models/friendRequest');

// Get all friends of a user

const getFriends = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await NormalUser.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch all friend details using the IDs stored in user.friends array
        const friends = await Promise.all(
            user.friends.map((friendId) => NormalUser.findById(friendId))
        );

        // Filter out any null values (in case some friends were deleted)
        // and format the response to only include necessary fields
        const formattedFriends = friends
            .filter(friend => friend !== null)
            .map(friend => ({
                _id: friend._id,
                username: friend.username,
                firstName: friend.firstName,
                lastName: friend.lastName,
                picturePath: friend.picturePath || null
            }));

        console.log('Formatted friends:', formattedFriends);
        res.status(200).json(formattedFriends);
    } catch (err) {
        console.error('Error in getFriends:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get all friend requests for a user
const getFriendRequests = async (req, res) => {
    try {
        const userId = req.params.id;
        const requests = await FriendRequest.find({
            receiver: userId,
            status: 'pending'
        }).populate('sender', 'username firstName lastName picturePath');

        const formattedRequests = requests.map(request => ({
            requestId: request._id,
            sender: {
                _id: request.sender._id,
                username: request.sender.username,
                firstName: request.sender.firstName,
                lastName: request.sender.lastName,
                picturePath: request.sender.picturePath
            },
            createdAt: request.createdAt
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

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ],
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ error: "Friend request already exists" });
        }

        // Create new friend request
        const newRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });

        await newRequest.save();
        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Accept a friend request
const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.params.id;
        const requestId = req.params.requestId;

        const request = await FriendRequest.findById(requestId);
        console.log("Accept friend request response: ", request);
        if (!request || request.receiver.toString() !== userId || request.status !== 'pending') {
            return res.status(404).json({ error: "Valid friend request not found" });
        }

        const [user, requester] = await Promise.all([
            NormalUser.findById(userId),
            NormalUser.findById(request.sender)
        ]);

        if (!user || !requester) {
            return res.status(404).json({ error: "One or both users not found" });
        }

        // Update request status
        request.status = 'accepted';
        request.respondedAt = new Date();

        // Add each user to the other's friends list
        user.friends.push(request.sender);
        requester.friends.push(userId);

        await Promise.all([
            request.save(),
            user.save(),
            requester.save()
        ]);

        res.status(200).json({ message: "Friend request accepted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reject a friend request
const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.params.id;
        const requestId = req.params.requestId;

        const request = await FriendRequest.findById(requestId);
        if (!request || request.receiver.toString() !== userId || request.status !== 'pending') {
            return res.status(404).json({ error: "Valid friend request not found" });
        }

        // Update request status
        request.status = 'rejected';
        request.respondedAt = new Date();
        await request.save();

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