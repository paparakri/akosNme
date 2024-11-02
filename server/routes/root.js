const express = require('express');
const router = express.Router();
const path = require('path');
const { register, login, loginClub } = require('../controllers/auth.js');
const { getReviewById } = require('../controllers/reviews');
const { addReservation, removeReservation } = require('../controllers/reservations');
const { getUserList } = require('../controllers/recs');
const { geocode, reverseGeocode } = require('../controllers/geocode.js');
const { getImage, uploadImage } = require('../controllers/images.js');
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

router.post('/image/upload/:folder/:fileName?', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        console.log(`Inside POST in /image/upload/${req.params.folder}/${req.params.fileName}`);
        console.log('File details:', {
            mimetype: req.file.mimetype,
            size: req.file.size,
            originalName: req.file.originalname
        });

        const result = await uploadImage({
            file: req.file.buffer,
            fileName: req.params.fileName,
            folder: req.params.folder,
            contentType: req.file.mimetype
        });
        res.status(200).json(result);
    } catch(err) {
        console.error("Upload error: ", err);
        res.status(500).json({error: err.message});
    }
});

router.get('/image/:folder/:fileName', async (req, res) => {
    try {
      const downloadURL = await getImage(req.params.fileName, req.params.folder);
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

module.exports = router;