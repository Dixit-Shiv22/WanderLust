const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const Review =  require("./review.js")

const listingSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image: {
    filename: {
        type: String,
        default: "listingimage"
    },
    url: {
        type: String,
        default: "https://images.unsplash.com/photo-1774575902298-564503f168a7?q=80&w=687&auto=format&fit=crop"
    }
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const Listing = mongoose.model("listing", listingSchema);
module.exports=Listing;


