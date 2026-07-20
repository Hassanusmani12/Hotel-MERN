const express = require('express');
const router = express.Router();
const { getAmenities, createAmenity, deleteAmenity } = require('../controllers/amenityController');

router.route('/')
    .get(getAmenities)
    .post(createAmenity);

router.route('/:id')
    .delete(deleteAmenity);

module.exports = router;
