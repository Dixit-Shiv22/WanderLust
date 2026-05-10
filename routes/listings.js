const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

const ValidateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let ErrMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, ErrMsg);
    } else {
        next();
    }
};

//index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

//new Route
router.get("/new", (req, res) => {
    res.render("listings/new");
});

//show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing });
}));

//create Route
router.post("/",
    ValidateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
}));

//update route
router.put("/:id",
    ValidateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let listing = req.body.listing;

        // If image URL field is empty, don't overwrite the existing image
        if (!listing.image || listing.image.trim() === "") {
            delete listing.image;
        } else {
            listing.image = { filename: "listingimage", url: listing.image };
        }

        await Listing.findByIdAndUpdate(id, listing);
        res.redirect(`/listings/${id}`);
    })
);

//delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;