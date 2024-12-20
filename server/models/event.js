const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const EventSchema = new mongoose.Schema({
    club: {
        type: ObjectId,
        ref: 'Club'
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    availableTickets: {
        type: Number,
        required: true
    },
    serviceProviders: {
        type: Array
    },
    eventType: {
        type: String, //e.g. concert, festival, etc.
    },
    minAge: {
        type: Number,
        required: true,
        default: 21
    },
    images: {
        type: Array,
        default: []
    }
},{timestamps:true});

EventSchema.post('save', async function(doc) {
    try {
      if (this.isNew) {
        await feedService.createEventPost(
          doc.club,
          doc._id,
          doc.name,
          doc.date,
          doc.description
        );
      }
    } catch (error) {
      console.error('Error creating feed post for event:', error);
    }
});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;