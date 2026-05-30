const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');
const { authUser } = require('../middlewares/auth.middleware');

router.get('/get-coordinates', mapController.getCoordinates);

router.get('/get-address', mapController.getAddress);

router.get('/get-distance', mapController.getDistance);

router.get('/get-suggestions', mapController.getSuggestions);

module.exports = router;
