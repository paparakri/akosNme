const ClubUser = require('../models/clubUser');
const NormalUser = require('../models/normalUser');
const Reservation = require('../models/reservation');
const Event = require('../models/event');
const mongoose = require('mongoose');

// POST
const addReservation = async (req, res) => {
    try {

        const userId = req.body.user;
        const { club, event, tableNumber, date, startTime, numOfGuests, specialRequests, minPrice } = req.body;

        console.log(`Searching for user with ID: ${userId}`);
        const normalUser = await NormalUser.findById(userId);

        if (!normalUser) {
            console.log(`User not found in database. Checking if ID is valid...`);
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.log(`Invalid ObjectId format`);
                return res.status(400).json({ message: "Invalid user ID format." });
            }
        }

        const clubUser = await ClubUser.findById(club);
        if (!clubUser) {
            console.log(`Club not found with ID: ${club}`);
            return res.status(404).json({ message: "Club not found." });
        }

        let eventObj;
        if (event && event !== '') {
            eventObj = await Event.findById(event);
            if (!eventObj) {
                return res.status(404).json({ message: "Event not found." });
            }
        }

        if (!normalUser || !clubUser) {
            return res.status(404).json({ message: "User or Club not found." });
        }

        // Parse date and time
        const [year, month, day] = date.split('-').map((x, i) => (i === 0 ? parseInt(x) : parseInt(x).toString().padStart(2, '0')));
        const [startHour, startMinute] = startTime.split(':').map(x => parseInt(x).toString().padStart(2, '0'));

        console.log(`Parsed date: ${year}-${month}-${day}`);
        console.log(`Parsed start time: ${startHour}:${startMinute}`);

        const reservationDate = `${day}-${month}-${year}`;
        const reservationStartTime = new Date(`${year}-${month}-${day}T${startHour}:${startMinute}:00`);

        // Validate parsed dates
        if ( isNaN(reservationStartTime.getTime()) ) {
            return res.status(400).json({ message: "Invalid date or time format." });
        }

        const newReservation = await Reservation.create({
            user: new mongoose.Types.ObjectId(userId),
            club: new mongoose.Types.ObjectId(club),
            event: event && event !== '' ? new mongoose.Types.ObjectId(event) : undefined,
            table: tableNumber || undefined,
            date: reservationDate,
            startTime: reservationStartTime,
            numOfGuests: Number(numOfGuests),
            status: 'pending',
            specialRequests: specialRequests || undefined,
            minPrice: Number(minPrice)
        });

        await NormalUser.updateOne(
            { _id: userId },
            { $push: { reservations: newReservation._id } }
        );

        await ClubUser.updateOne(
            { _id: club },
            { $push: { reservations: newReservation._id } }
        );

        res.status(201).json({ message: "Reservation added.", reservation: newReservation });
    } catch (err) {
        console.log(`Error in addReservation:`, err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const removeReservation = async (req, res) => {
    try {
        const { reservationId } = req.body; // Only receive reservationId from the frontend

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        // Remove the reservation
        await Reservation.deleteOne({ _id: reservationId });

        // Remove the reservation ID from the user's reservations array
        await NormalUser.updateOne(
            { _id: reservation.user }, // Assuming the reservation has a user field
            { $pull: { reservations: new mongoose.Types.ObjectId(reservationId) } }
        );

        // Remove the reservation ID from the club's reservations array
        await ClubUser.updateOne(
            { _id: reservation.club },
            { $pull: { reservations: new mongoose.Types.ObjectId(reservationId) } }
        );

        res.status(200).json({ message: "Reservation removed." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET
const getReservations = async (req, res) => {
    try {
        const userId = req.params.id;
        const normalUser = await NormalUser.findById(userId);

        if (!normalUser) {
            return res.status(404).json({ message: "User not found." });
        }

        let reservations = await Promise.all(
            normalUser.reservations.map((id) => Reservation.findById(id))
        );

        reservations = await Promise.all(reservations.map(async (reservation) => {
            if(reservation){
                console.log("Checking reservation: ", reservation);
                const club = await ClubUser.findById(reservation.club);
                console.log("Got club: ", club);
                const event = await Event.findById(reservation.event);
                return {
                    ...reservation._doc,
                    club: club ? club.displayName : null,
                    event: event ? event.name : null
                };
            }
        }));

        res.status(200).json(reservations);
    } catch (err) {
        console.log("Yeah im throwing this error!!!");
        res.status(400).json({ error: err.message });
    }
};

// PUT
const updateReservation = async (req, res) => {
    try {
        const { _id, table, date, startTime, numOfGuests, specialRequests, minPrice, status } = req.body;

        const reservation = await Reservation.findById(_id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(
            _id,
            { table, date, startTime, numOfGuests, specialRequests, minPrice, status },
            { new: true }
        );

        res.status(200).json({ message: "Reservation updated.", reservation: updatedReservation });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getReservationById = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }
        res.status(200).json(reservation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getClubReservations = async (req, res) => {
    try {
        const clubId = req.params.user;
        console.log(clubId);
        const club = await ClubUser.findById(clubId);
        if (!club) {
            return res.status(404).json({ message: "Club not found." });
        }
        const reservations = await Reservation.find({ club: clubId });
        res.status(200).json(reservations);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { addReservation, removeReservation, getReservations, updateReservation, getReservationById, getClubReservations };