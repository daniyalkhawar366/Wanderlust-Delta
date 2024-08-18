const Listing=require("../models/listing");
const Review=require("../models/review");


module.exports.createReview=async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview=async(req, res) => {
    const { id, reviewID } = req.params;
    const listingUpdateResult = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    const reviewDeleteResult = await Review.findByIdAndDelete(reviewID);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};