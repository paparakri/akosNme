const ClubUser = require('../models/clubUser');
const ServiceProviderUser = require('../models/serviceProviderUser');
const Review = require('../models/review');
const NormalUser = require('../models/normalUser');
const Event = require('../models/event');
const mongoose = require('mongoose');

// GET
const getEvents = async (req, res) => {
    try {
        console.log(`Getting Events for club`);
        const clubId = req.params.user;

        console.log(`Searching for club with ID: ${clubId}`);
        const clubUser = await ClubUser.findById(clubId);
        
        if (!clubUser) {
            console.log(`Club not found in database. Checking if ID is valid...`);
            if (!mongoose.Types.ObjectId.isValid(clubId)) {
                console.log(`Invalid ObjectId format`);
                return res.status(400).json({ message: "Invalid club ID format." });
            }
            return res.status(404).json({ message: "Club not found." });
        }

        // Filter out any null events before processing
        let events = await Promise.all(
            clubUser.events.map((id) => Event.findById(id))
        );
        
        // Filter out null events
        events = events.filter(event => event !== null);

        // Map remaining valid events
        events = await Promise.all(events.map(async (event) => {
            try {
                const club = await ClubUser.findById(event.club);
                const serviceProviders = await Promise.all(
                    (event.serviceProviders || []).map(async (id) => {
                        try {
                            return await ServiceProviderUser.findById(id);
                        } catch (err) {
                            console.log(`Error finding service provider ${id}:`, err);
                            return null;
                        }
                    })
                );

                return {
                    ...event._doc,
                    club: club ? club.displayName : 'Unknown Club',
                    serviceProviders: serviceProviders
                        .filter(sp => sp !== null)
                        .map(sp => sp.displayName)
                };
            } catch (err) {
                console.log(`Error processing event ${event._id}:`, err);
                return null;
            }
        }));

        // Filter out any events that failed to process
        events = events.filter(event => event !== null);

        res.status(200).json(events);
    } catch (err) {
        console.log(`Error in getEvents:`, err);
        res.status(400).json({ error: err.message });
    }
};

const getAllEvents = async (req, res) => {
    try {
        console.log(`Getting all events`);
        const events = await Event.find();

        res.status(200).json(events);
    } catch (err) {
        console.log(`Error in getAllEvents:`, err);
        res.status(400).json({ error: err.message });
    }
}

// POST
const postEvent = async (req, res) => {
    try {
        console.log(`Adding Event`);
        console.log('Request body:', req.body);

        const clubId = req.params.user;
        const { name, description, date, startTime, price, availableTickets, serviceProviders, eventType, minAge, images } = req.body;

        // Validate required fields
        if (!name || !description || !date || !startTime || !price || !availableTickets) {
            return res.status(400).json({ 
                message: "Missing required fields",
                required: {
                    name: !name,
                    description: !description,
                    date: !date,
                    startTime: !startTime,
                    price: !price,
                    availableTickets: !availableTickets
                }
            });
        }

        console.log(`Searching for club with ID: ${clubId}`);
        const clubUser = await ClubUser.findById(clubId);
        
        if (!clubUser) {
            console.log(`Club not found in database. Checking if ID is valid...`);
            if (!mongoose.Types.ObjectId.isValid(clubId)) {
                console.log(`Invalid ObjectId format`);
                return res.status(400).json({ message: "Invalid club ID format." });
            }
            return res.status(404).json({ message: "Club not found." });
        }

        const newDate = new Date(date).toLocaleDateString('pt-BR').replace(/\//g, '-');
        const newStartTime = new Date(`${date}T${startTime}`);

        console.log(`Creating new event with date: ${newDate} and startTime: ${newStartTime}`);

        const newEvent = await Event.create({
            club: clubId, // Make sure this is stored as an ObjectId
            name,
            description,
            date: newDate,
            startTime: newStartTime,
            price: Number(price),
            availableTickets: Number(availableTickets),
            serviceProviders: serviceProviders ? serviceProviders.map(id => new mongoose.Types.ObjectId(id)) : [],
            eventType: eventType || 'General',
            minAge: Number(minAge) || 21,
            images: images || []
        });

        console.log('New event created:', newEvent);

        // Update the club's events array
        await ClubUser.findByIdAndUpdate(
            clubId,
            { $push: { events: newEvent._id } },
            { new: true }
        );

        res.status(201).json({ message: "Event added successfully.", event: newEvent });
    } catch (err) {
        console.log(`Error in postEvent:`, err);
        res.status(400).json({ error: err.message });
    }
};

// PUT
const updateEvent = async (req, res) => {
    try {
        const clubId = req.params.user;
        const { _id, name, description, date, startTime, price, availableTickets, serviceProviders, eventType, minAge, images } = req.body;

        console.log( { _id, name, description, date, startTime, price, availableTickets, serviceProviders, eventType, minAge, images } );

        const event = await Event.findById(_id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        if (event.club.toString() !== clubId) {
            return res.status(403).json({ message: "You can only update your own events." });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            _id,
            {
                name,
                description,
                date: date,
                startTime: new Date(startTime),
                price: Number(price),
                availableTickets: Number(availableTickets),
                serviceProviders: serviceProviders ? serviceProviders.map(id => new mongoose.Types.ObjectId(id)) : event.serviceProviders,
                eventType,
                minAge: Number(minAge),
                images: images || event.images
            },
            { new: true }
        );

        res.status(200).json({ message: "Event updated.", event: updatedEvent });
    } catch (err) {
        console.log(`Error in updateEvent:`, err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        // Remove the event
        await Event.deleteOne({ _id: eventId });

        // Remove the event ID from the club's events array
        await ClubUser.updateOne(
            { _id: event.club },
            { $pull: { events: new mongoose.Types.ObjectId(eventId) } }
        );

        res.status(200).json({ message: "Event removed." });
    } catch (err) {
        console.log(`Error in deleteEvent:`, err);
        res.status(400).json({ error: err.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }
        res.status(200).json(event);
    } catch (err) {
        console.log(`Error in getEventById:`, err);
        res.status(400).json({ error: err.message });
    }
}

module.exports = { getAllEvents, getEvents, postEvent, updateEvent, deleteEvent, getEventById };