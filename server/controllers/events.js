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

        let events = await Promise.all(
            clubUser.events.map((id) => Event.findById(id))
        );

        events = await Promise.all(events.map(async (event) => {
            const club = await ClubUser.findById(event.club);
            const serviceProviders = await Promise.all(
                event.serviceProviders.map(id => ServiceProviderUser.findById(id))
            );
            return {
                ...event._doc,
                club: club ? club.displayName : null,
                serviceProviders: serviceProviders.map(sp => sp ? sp.displayName : null)
            };
        }));

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
        console.log(req.body);

        const clubId = req.params.user;
        const { name, description, date, startTime, price, availableTickets, serviceProviders, eventType, minAge, images } = req.body;

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

        const newDate = new Date(date);
        const newStartTime = new Date(date+"T"+startTime);

        console.log(`newDate: ${newDate} || newStartTime: ${newStartTime}`);

        const newEvent = await Event.create({
            club: new mongoose.Types.ObjectId(clubId),
            name,
            description,
            date: newDate,
            startTime: newStartTime,
            price: Number(price),
            availableTickets: Number(availableTickets),
            serviceProviders: serviceProviders ? serviceProviders.map(id => new mongoose.Types.ObjectId(id)) : [],
            eventType: eventType || undefined,
            minAge: Number(minAge) || 21,
            images: images || []
        });

        await ClubUser.updateOne(
            { _id: clubId },
            { $push: { events: newEvent._id } }
        );

        res.status(201).json({ message: "Event added.", event: newEvent });
    } catch (err) {
        console.log(`Error in postEvent:`, err);
        res.status(400).json({ error: err.message });
    }
};

// PUT
const updateEvent = async (req, res) => {
    try {
        const clubId = req.params.user;
        const { eventId, name, description, date, startTime, price, availableTickets, serviceProviders, eventType, minAge, images } = req.body;

        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        if (event.club.toString() !== clubId) {
            return res.status(403).json({ message: "You can only update your own events." });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                name,
                description,
                date: new Date(date),
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