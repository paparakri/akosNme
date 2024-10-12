const Reservation = require('../models/reservation');

const postReservation = (req, res) => {
    try{
        const data = req.body;
        const validationResult = Reservation.validate(data);
        console.log("Validation result for Reservation Posting: ", validationResult);
        if(validationResult.error){
            return res.status(400).json(validationResult.error);
        }
        const newReservation = new Reservation(data);
        newReservation.save()
       .then(reservation => res.status(201).json(reservation))
    } catch(err){
        return res.status(400).json(err);
    }
}

const getReservation = (req, res) => {
    try{
        const { id } = req.body.id;
        Reservation.findById(id)
       .then(reservation => res.status(200).json(reservation))
    } catch(err){
        return res.status(400).json(err);
    }
}

const updateReservation = (req, res) => {
    try{
        const data = req.body;
        const validationResult = Reservation.validate(req.body);
        console.log("Validation result for Event Update: ", validationResult);
        if(validationResult.error){
            return res.status(400).json(validationResult.error);
        }
        const id = req.body.id;
        Reservation.findByIdAndUpdate(id, data);
    } catch(err){
        return res.status(400).json(err);
    }
}

const deleteReservation = (req, res) => {
    try{
        const id = req.body.id;
        Reservation.findByIdAndDelete(id);
    } catch(err){
        return res.status(400).json(err);
    }
}

module.exports = {getReservation, postReservation, updateReservation, deleteReservation};