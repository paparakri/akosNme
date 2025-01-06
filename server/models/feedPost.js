const mongoose = require('mongoose');

// Schema definition
const FeedPostSchema = new mongoose.Schema({
  postType: {
    type: String,
    enum: ['event', 'reservation', 'review'],
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    eventName: String,
    eventDate: String,
    eventDescription: String,
    
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    reservationDate: String,
    guestCount: Number,
    tableNumber: String,
    
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    rating: Number,
    reviewText: String
  },
  groupedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedPost'
  }],
  visibility: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowedViewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

// Indexes for optimizing queries
FeedPostSchema.index({ actor: 1, createdAt: -1 });
FeedPostSchema.index({ club: 1, createdAt: -1 });
FeedPostSchema.index({ postType: 1, createdAt: -1 });

// Create the model
const FeedPost = mongoose.model('FeedPost', FeedPostSchema);

module.exports = FeedPost;