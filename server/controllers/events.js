const ClubUser = require('./../models/clubUser');
const ServiceProviderUser = require('./../models/serviceProviderUser');
const Review = require('./../models/review');
const NormalUser = require('./../models/normalUser');
const Event = require('./../models/event');

//GET
const getEvents = async (req, res) => {
    try{
        const user = req.params.user;
        const clubUser = await ClubUser.findById(user);
        console.log(clubUser);

        let events = await Promise.all(
            clubUser.events.map((id) => Event.findById(id))
        );

        events = await Promise.all(events.map(async (event) => {
            const club = await ClubUser.findById(event.Organizer);
            return {
                ...event._doc,
                Organizer: club ? club.displayName : null
            };
        }));

        res.status(200).json(events);

    } catch(err){
        res.status(400).json( { error: err.message });
    }
}

//POST
const postEvent = async (req, res) => {
    try{
        let data = req.body;
        const user = req.params.user;
        const clubUser = await ClubUser.findById(user);
        data.organizer = clubUser._id;
        

        const newEvent = await Event.create(data);

        clubUser.events.push(newEvent._id);
        await clubUser.save();

        res.status(200).json(clubUser);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
}

//PUT
const updateEvent = async (req, res) => {
    try{
        const data = req.body;
        const eventId = data._id;
        const event = await Event.findByIdAndUpdate(eventId, data);
        if(!event) throw new Error('Event not found');
        res.status(200).json(event);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

//DELETE
const deleteEvent = async (req, res) => {
    try{
        const eventId = req.body.eventId;
        const event = await Event.findByIdAndDelete(eventId);
        if(!event) throw new Error('Event not found');
        res.status(200).json(event);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

module.exports = { getEvents, postEvent, updateEvent, deleteEvent };