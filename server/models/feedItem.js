const mongoose = require('mongoose');

const feedItemSchema = new mongoose.Schema({
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['normal', 'club', 'serviceProvider'], required: true },
    displayName: { type: String, required: true },
    picturePath: String
  },
  verb: { 
    type: String, 
    enum: ['posted_review', 'made_reservation', 'followed_club', 'followed_provider', 'upcoming_event'],
    required: true 
  },
  object: {
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType: { type: String, required: true },
    content: mongoose.Schema.Types.Mixed  // Flexible content field
  },
  metadata: {
    privacy: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    location: String,
    tags: [String]
  },
  createdAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

// Compound index for efficient feed querying
feedItemSchema.index({ 'actor.userId': 1, createdAt: -1 });
feedItemSchema.index({ 'object.targetId': 1, createdAt: -1 });

const FeedItem = mongoose.model("FeedItem", feedItemSchema);
module.exports = FeedItem;