const Listing =require("../models/listing");
const axios = require("axios");

module.exports.index= async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
};

module.exports.trending=async(req,res)=>{
    const trendListings = await Listing.find({ tag: "Trending" });
    res.render("./listings/trending.ejs", { trendListings });
};

module.exports.rooms=async(req,res)=>{
    const roomListings = await Listing.find({ tag: "Rooms" });
    res.render("./listings/rooms.ejs", { roomListings });
};

module.exports.cities=async(req,res)=>{
    const cityListings = await Listing.find({ tag: "City" });
    res.render("./listings/city.ejs", { cityListings });
};

module.exports.mountains=async(req,res)=>{
    const mountainListings = await Listing.find({ tag: "Mountains" });
    res.render("./listings/mountains.ejs", { mountainListings });
};

module.exports.castles=async(req,res)=>{
    const castleListings = await Listing.find({ tag: "Castle" });
    res.render("./listings/castle.ejs", { castleListings });
};

module.exports.pools=async(req,res)=>{
    const poolListings = await Listing.find({ tag: "Pool" });
    res.render("./listings/pools.ejs", { poolListings });
};

module.exports.camping=async(req,res)=>{
    const campingListings = await Listing.find({ tag: "Camping" });
    res.render("./listings/camping.ejs", { campingListings });
};

module.exports.farms=async(req,res)=>{
    const farmListings = await Listing.find({ tag: "Farms" });
    res.render("./listings/farms.ejs", { farmListings });
};

module.exports.snowy=async(req,res)=>{
    const snowyListings = await Listing.find({ tag: "Snowy" });
    res.render("./listings/snowy.ejs", { snowyListings });
};


module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    }).populate("owner");
    if(!listing){
        req.flash("error","Listing Does not Exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const { location, country,tag } = req.body.listing;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.tag=tag;

    try {
        if (!location || !country) {
            req.flash("error", "Address and country are required.");
            return res.redirect("/listings/new");
        }

        const apiKey = '5cHrGhU0GidBU1MH7JJnOtqdNvOMlXnOkF0hgUn3e70'; 
        const fullAddress = `${location}, ${country}`;
        
        const geocodeUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${apiKey}`;
        const response = await axios.get(geocodeUrl);


        if (response.data.items.length > 0) {
            const location = response.data.items[0].position;
            newListing.geometry = {
                type: "Point",
                coordinates: [location.lng, location.lat] 
            };
        } else {
            req.flash("error", "Could not geocode the provided address.");
            return res.redirect("/listings/new");
        }

        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (error) {
        console.error("Geocoding error:", error);
        req.flash("error", "There was a problem creating the listing. Please try again.");
        res.redirect("/listings/new");
    }
};

module.exports.searchListings = async (req, res) => {
    const query = req.query.q || ''; 
    
    try {
        const searchCriteria = {
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Case-insensitive search for title
                { description: { $regex: query, $options: 'i' } }, // Case-insensitive search for description
                { location: { $regex: query, $options: 'i' } }, // Case-insensitive search for location
                { country: { $regex: query, $options: 'i' } }, // Case-insensitive search for country
                { tag: { $regex: query, $options: 'i' } } // Case-insensitive search for tag
            ]
        };

        // Execute the search
        const searchResults = await Listing.find(searchCriteria);

        // Pass both searchResults and query to the view
        res.render('./listings/searchResults.ejs', { searchResults, query });
    } catch (error) {
        console.error('Search error:', error);
        req.flash('error', 'An error occurred while searching. Please try again.');
        res.redirect('/');
    }
};




module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing Does not Exist!");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl = originalImageUrl
    .replace(/w=\d+/, "w=250") 
    .replace(/q=\d+/, "q=30");
    res.render("./listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    res.redirect(`/listings/${id}`);
    console.log(req.body.listing);
};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};