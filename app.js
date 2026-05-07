const express=require("express");
const app=express();
const mongoose= require("mongoose");
const port=8080;
const Listing=require("./models/listing.js");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate = require("ejs-mate"); 
const MONGO_URL='mongodb://127.0.0.1:27017/Wanderlust'
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema,reviewSchema}= require("./schema.js");
const Review=require("./models/review.js");

main().then(()=>console.log("connected to DB"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.get("/",(req,res)=>{
    res.send("root is working");
});
app.use(express.static(path.join(__dirname,"/public")));

const ValidateListing = (req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
        if(error){
            let ErrMsg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400, ErrMsg);
        }else{
            next();
        }
};

const ValidateReview = (req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
        if(error){
            let ErrMsg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400, ErrMsg);
        }else{
            next();
        }
};

//index Route
app.get("/listings",wrapAsync( async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
}));

//new Route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new");
})

//show Route
app.get("/listings/:id",wrapAsync( async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show" , {listing});
}));

//create Route

app.post("/listings",
    ValidateListing,
    wrapAsync(async (req,res, next)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("listings");
    })
);

//edit route
app.get("/listings/:id/edit",wrapAsync(async  (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", {listing});
}));

// update route
app.put("/listings/:id",
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
}));

//delete Route

app.delete("/listings/:id" ,wrapAsync( async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// Reviews

app.post("/listings/:id/reviews",ValidateReview,
    wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));


// Delete Review Route
app.delete(
    "/listings/:id/reviews/:reviewId",
    wrapAsync(async (req, res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    })
);

// app.get("/testlisting", async (req,res)=>{
//     let sampleListing= new Listing({
//         title: "my new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "kanpur , up",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("sapmle was saved");
//     res.send("successfully testing");
// });

app.use((req,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something Went Wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(port,()=>{
    console.log("app is listening on port 8080");
});



