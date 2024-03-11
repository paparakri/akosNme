const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const EventSchema = new mongoose.Schema({
    organizer: {
        type: ObjectId,
        required: true,
        min: 3,
        max: 50
    },
    title: {
        type: String,
        required: true,
        min: 3,
        max: 50
    },
    description: {
        type: String,
        required: true,
        min: 3,
        max: 200
    },
    date: {
        type: Date,
        required: true
    },
    picturePath: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        required: true,
        min: 3,
        max: 50
    },
    interested: {
        type: Array,
        default: []
    },
    going: {
        type: Array,
        default: []
    },
    artists: {
        type: Array,
        default: []
    }
});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;