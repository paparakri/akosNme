const express = require('express');
const router = express.Router();
const path = require('path');
const { register, login, loginClub } = require('../controllers/auth.js');
const { getReviewById } = require('../controllers/reviews');
const { addReservation, removeReservation, updateReservation } = require('../controllers/reservations');
const { getUserList } = require('../controllers/recs');
const { geocode, reverseGeocode } = require('../controllers/geocode.js');
const { getImage, uploadImage } = require('../controllers/images.js');
const {getAllEvents, getEventById} = require('../controllers/events');
const multer = require('multer');

router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
});

router.get('/artists(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views' , 'artists.html'));
});

//Images

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});

router.post('/image/upload/:fileName?', upload.single('file'), async (req, res) => {
    try {
        const folderPath = req.body.folderPath;
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        console.log(`Inside POST in /image/upload/${folderPath}/${req.params.fileName}`);
        console.log('File details:', {
            mimetype: req.file.mimetype,
            size: req.file.size,
            originalName: req.file.originalname
        });

        const result = await uploadImage({
            file: req.file.buffer,
            fileName: req.params.fileName,
            folder: folderPath,
            contentType: req.file.mimetype
        });
        res.status(200).json(result);
    } catch(err) {
        console.error("Upload error: ", err);
        res.status(500).json({error: err.message});
    }
});

router.get('/image/:fileName', async (req, res) => {
    try {
      const folderPath = req.params.folderPath;
      const downloadURL = await getImage(req.params.fileName, folderPath);
      res.json({ downloadURL });
    } catch (error) {
      console.error('Get image error:', error);
      res.status(500).json({ error: error.message });
    }
});

router.route('/review/:id')
    .get(getReviewById);

router.route('/reservations')
    .post(addReservation)
    .put(updateReservation)
    .delete(removeReservation);

router.route('/ClubLogin')
    .post(loginClub);

router.route('/UserLogin')
    .post(login);

router.route('/UserRegister')
    .post(register);

router.route('/get-list/:category')
    .get(getUserList);

router.route('/geocode/:address')
    .get(geocode)

router.route('/reverse-geocode/:lat/:lng')
    .get(reverseGeocode)

router.route('/events')
    .get(getAllEvents);

router.route('/events/:id')
    .get(getEventById);

module.exports = router;