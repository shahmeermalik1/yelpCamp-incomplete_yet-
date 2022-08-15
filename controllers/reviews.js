//require the reviews model.  :)
const review = require('../review');

//imoprt the campground model .
const campground = require('../campground');

module.exports.postR = async(req,res) =>{
    const Campground = await campground.findById(req.params.id);
    const review1 = new review(req.body.review);
    Campground.reviews.push(review1);
    await review1.save();
    await Campground.save();
    res.redirect(`/campgrounds/${Campground._id}`)
}

module.exports.deleteR = async(req,res) =>{
    const {id, reviewId} = req.params;
    await campground.findByIdAndUpdate(id, {$pull:{ reviews:reviewId}}); // this lines removes the review from the databse
    await review.findByIdAndDelete(reviewId);// this line only removes the campground from the show page
    res.redirect(`/campgrounds/${id}`);
}