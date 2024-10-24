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
    endTime: {
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

const Reservation = mongoose.model('Reservation', ReservationSchema);
module.exports = Reservation;