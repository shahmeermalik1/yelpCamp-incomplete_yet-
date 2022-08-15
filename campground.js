const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const review = require('./review');


const ImageSchema = new Schema({ 
           url : String,
            filename : String
        
    
})
ImageSchema.virtual('thumbnail').get(function(){
   return this.url.replace('/upload','/upload/h_1000')
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,

    reviews: [
       { type: Schema.Types.ObjectId,
        ref: 'Review',
        }
             ],
    user: 
       { type: Schema.Types.ObjectId,
        ref: 'User',
        }
    
})
// To delete the reviews assosiated with the deleted camp
CampgroundSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema);
