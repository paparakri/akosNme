const ClubUser = require('../models/clubUser');
const Reservation = require('../models/reservation');
const mongoose = require('mongoose');

/**
 * Get table availability for a club within a date range
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getRangeAvailability = async (req, res) => {
    try {
        const clubId = req.params.user;
        const { startDate, endDate } = req.query;

        // Validate inputs
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Both startDate and endDate are required'
            });
        }

        const formatDateForComparison = (date) => {
            const d = new Date(date);
            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        };

        // Parse dates and validate
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                error: 'Invalid date format'
            });
        }

        if (end < start) {
            return res.status(400).json({
                error: 'endDate must be after startDate'
            });
        }

        // Get club details first
        const club = await ClubUser.findById(clubId);
        if (!club) {
            return res.status(404).json({
                error: 'Club not found'
            });
        }

        const totalTables = club.capacity;

        // Get all reservations within the date range
        const reservations = await Reservation.aggregate([
            {
                $match: {
                    club: new mongoose.Types.ObjectId(clubId),
                    date: {
                        $gte: formatDateForComparison(start),
                        $lte: formatDateForComparison(end)
                    },
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$date',
                    reservedTables: { $sum: 1 }
                }
            }
        ]);

        //console.log("Current reservations: ", reservations)

        // Create availability map
        const availabilityMap = new Map();
        let currentDate = new Date(start);

        while (currentDate <= end) {
            const dateString = currentDate.toISOString().split('T')[0].split('-').reverse().join('-');
            const dayReservations = reservations.find(r => r._id === dateString);
            const reservedTables = dayReservations ? dayReservations.reservedTables : 0;
            const availableTables = Math.max(0, totalTables - reservedTables);

            //console.log(`Trying with following info: ${dateString}, ${totalTables}, ${reservedTables}, ${availableTables}`)

            availabilityMap.set(dateString, {
                date: dateString,
                totalTables,
                reservedTables,
                availableTables,
                hasAvailability: availableTables > 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Convert map to array for response
        const availability = Array.from(availabilityMap.values());

        //console.log(availabilityMap);

        // Return the availability data
        res.status(200).json({
            clubId,
            clubName: club.displayName,
            totalTables,
            availability,
            dateRange: {
                start: start.toISOString().split('T')[0].split('-').reverse().join('-'),
                end: end.toISOString().split('T')[0].split('-').reverse().join('-')
            }
        });

    } catch (error) {
        console.error('Error in getRangeAvailability:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = { getRangeAvailability };