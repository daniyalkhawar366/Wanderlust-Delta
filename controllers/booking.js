// controllers/bookingController.js
const Listing = require('../models/listing');
const Booking = require('../models/booking');

module.exports.createBooking = async (req, res) => {
    const { listingId, startDate, endDate } = req.body;
    const user = req.user; // assuming user is authenticated

    try {
        const listing = await Listing.findById(listingId);
        const newBooking = new Booking({
            listing: listingId,
            user: user._id,
            startDate,
            endDate
        });

        listing.bookings.push(newBooking);
        await newBooking.save();
        await listing.save();

        res.status(201).json({ message: 'Booking created successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
