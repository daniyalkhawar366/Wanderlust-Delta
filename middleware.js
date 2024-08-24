const Listing=require("./models/listing");
const Review=require("./models/review");
const {listingSchema,reviewSchema}=require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create a listing");
        return res.redirect("/login");
}
next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        if (!listing.owner.equals(req.user._id) && !res.locals.isAdmin) {
            req.flash("error", "Only the owner or admin can make changes!");
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (error) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/listings");
    }
};



module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { reviewID } = req.params;
        const review = await Review.findById(reviewID).populate('author');

        if (!review) {
            req.flash("error", "Review not found!");
            return res.redirect(`/listings/${req.params.id}`);
        }

        if (!review.author) {
            req.flash("error", "Review author not found!");
            return res.redirect(`/listings/${req.params.id}`);
        }

        if (!review.author._id.equals(req.user._id) && !res.locals.isAdmin) {
            req.flash("error", "You do not have permission to delete this review.");
            return res.redirect(`/listings/${req.params.id}`);
        }

        next();
    } catch (error) {
        req.flash("error", "Something went wrong.");
        res.redirect(`/listings/${req.params.id}`);
    }
};



module.exports.validateListing=((req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
})

module.exports.validateReview=((req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
})

const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

module.exports.adminAuth = async (req, res, next) => {
    const { ADMIN_USERNAME } = process.env;

    if (req.user && req.user.username === ADMIN_USERNAME) {
        res.locals.isAdmin = true;
    } else {
        res.locals.isAdmin = false;
    }

    console.log('Admin Middleware:', req.user);
    console.log('isAdmin:', res.locals.isAdmin);

    next();
};








