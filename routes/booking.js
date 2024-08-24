
const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

router.post('/:id/bookings', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ success: false, error: 'unauthorized' });
    }

    const { date } = req.body;
    const listing = await Listing.findById(req.params.id);

    // Check if the date is already booked
    const existingBooking = await Booking.findOne({ listing: listing._id, date });
    if (existingBooking) {
        return res.json({ success: false, error: 'already booked' });
    }

    // Create new booking
    const newBooking = new Booking({
        listing: listing._id,
        date,
        user: req.user._id // Associate the booking with the logged-in user
    });
    await newBooking.save();

    res.json({ success: true });
});


module.exports = router;
