const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listings.js");

const multer=require('multer');
const{storage}=require("../cloudConfig.js");
const upload=multer({storage});

router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing));


router.get("/trending",wrapAsync(listingController.trending));

router.get("/rooms",wrapAsync(listingController.rooms));

router.get("/cities",wrapAsync(listingController.cities));

router.get("/mountains",wrapAsync(listingController.mountains));

router.get("/castles",wrapAsync(listingController.castles));

router.get("/pools",wrapAsync(listingController.pools));

router.get("/camping",wrapAsync(listingController.camping));

router.get("/farms",wrapAsync(listingController.farms));

router.get("/snowy",wrapAsync(listingController.snowy));

router.get("/search", wrapAsync(listingController.searchListings));

router.get("/new",isLoggedIn,listingController.renderNewForm);

router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));


router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


module.exports=router;