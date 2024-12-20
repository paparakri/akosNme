const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ReservationSchema = new mongoose.Schema({
    club: {
        type: ObjectId,
        required: true,
        min: 3,
        max: 50
    },
    user: {
        type: ObjectId,
        required: true,
        min: 3,
        max: 50
    },
    event: {
        type: ObjectId,
        min: 3,
        max: 50
    },
    table: {
        type: Object
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    numOfGuests: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    specialRequests: {
        type: String
    },
    minPrice: {
        type: Number
    }
},{timestamps:true});

ReservationSchema.post('save', async function(doc) {
  try {
    // Only create feed post for new reservations
    if (this.isNew) {
      await feedService.createReservationPost(
        doc.user,
        doc.club,
        doc._id,
        doc.date,
        doc.numOfGuests,
        doc.tableNumber
      );
    }
  } catch (error) {
    console.error('Error creating feed post for reservation:', error);
    // Don't throw error to prevent blocking reservation creation
  }
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
module.exports = Reservation;