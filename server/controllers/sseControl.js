const Reservation = require('../models/reservation');

const reservationStream = (req, res) => {
    const clubId = req.params.user;
    console.log("Reservation Stream Called with user/id: ", clubId);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    let changeStream = Reservation.watch().on('change', (change) => {
                            console.log("Creating Message");
                            const message = {
                                type: change.operationType,
                                data: change.fullDocument
                            }
                            console.log(message);
                            res.write(`data: ${JSON.stringify(message)}\n\n`);
                        });

/* const changeStream = Reservation.watch([
        {
            $match: {
                'fullDocument.club': clubId,
                operationType: { $in: ['insert', 'update', 'delete'] }
            }
        }
    ], {
        fullDocument: 'updateLookup'
    });

    // Handle each change
    changeStream.on('change', (change) => {

        console.log("Change Detected in Reservation Collection. Sending following message: ");

        const message = {
            type: change.operationType,
            data: change.fullDocument
        };

        console.log(message);
        
        res.write(`data: ${JSON.stringify(message)}\n\n`);
    });
*/

    // Send initial heartbeat
    res.write('data: {"type":"connected"}\n\n');

    // Cleanup on close
    req.on('close', () => {
        console.log(`Client ${clubId} connection closed`);
        changeStream.close();
    }); 
}


module.exports = {
    reservationStream
}