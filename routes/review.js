const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js")
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const methodOverride = require("method-override");
router.use(methodOverride("_method"));
const {validateReview, isReviewAuthor}=require("../middleware.js");
const {isLoggedIn}=require("../middleware.js");

const reviewController=require("../controllers/review.js");
//Reviews
router.post("/", isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

//Delete Review Route
router.delete("/:reviewID", isLoggedIn,isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);


module.exports=router;