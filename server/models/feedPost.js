const mongoose = require('mongoose');

// Schema definition
const FeedPostSchema = new mongoose.Schema({
  postType: {
    type: String,
    enum: ['event', 'reservation', 'review'],
    required: true
  },
  actor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    eventName: String,
    eventDate: Date,
    eventDescription: String,
    
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
    reservationDate: Date,
    guestCount: Number,
    tableNumber: String,
    
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
    rating: Number,
    reviewText: String
  },
  groupedPosts: [{
    type: Schema.Types.ObjectId,
    ref: 'FeedPost'
  }],
  visibility: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowedViewers: [{
      type: Schema.Types.ObjectId,
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
const FeedPost = mongoose.model<IFeedPost>('FeedPost', FeedPostSchema);

export default FeedPost;