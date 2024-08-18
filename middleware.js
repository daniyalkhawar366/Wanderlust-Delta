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

module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","Only the owner can make changes!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

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
        
        if (!review.author._id.equals(req.user._id)) {
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
