const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;


const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await review.deleteMany({
            _id: {
                $in:doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', campgroundSchema);