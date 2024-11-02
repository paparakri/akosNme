const mongoose = require('mongoose');
const FeedItem = require('../models/feedItem');

const createFeedItem = async ({
    actor,
    verb,
    object,
    metadata = { privacy: 'public' }
}) => {
    try {
        await FeedItem.create({
            actor,
            verb,
            object,
            metadata
        });
    } catch (error) {
        console.error('Error creating feed item:', error);
    }
};

module.exports = { createFeedItem };