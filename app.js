const express=require("express");
const app=express();
const mongoose= require("mongoose");
const port=8080;
const path= require("path");
const methodOverride= require("method-override");
const ejsMate = require("ejs-mate"); 
const MONGO_URL='mongodb://127.0.0.1:27017/Wanderlust'
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");

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

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.use((req,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something Went Wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(port,()=>{
    console.log("app is listening on port 8080");
});