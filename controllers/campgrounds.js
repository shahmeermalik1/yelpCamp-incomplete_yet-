//imoprt the campground model .
const campground = require('../campground');


module.exports.index = async(req,res) => {
    const campgrounds =  await campground.find({});
    res.render('campgrounds/campground_index', {campgrounds});   
}


module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/newForm')
}

module.exports.createCamp = async(req,res,next) =>{
    // if(!req.body.campground) throw new expressError('Invalid Campground data', 404)
    const newCampground = new campground(req.body.campground);
    newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newCampground.user = req.user._id;
    await newCampground.save();
   
    req.flash('success', 'Successfully made a new campground')
    res.redirect('/campgrounds');
}

module.exports.editCamp = async (req,res) =>{
    const campgroundInfo =await campground.findById(req.params.id);
    res.render('campgrounds/editForm',{campgroundInfo})
}

module.exports.showCamp = async(req,res) =>{
    const campgroundInfo =await campground.findById(req.params.id).populate('reviews').populate('user');
   
        res.render('campgrounds/description',{campgroundInfo})
}

module.exports.editCampPut = async(req,res) =>{
    const {id} = req.params;
    const Camp = await campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success' , 'updated the camp')
    res.redirect('/campgrounds');
 
 }

 module.exports.deleteCamp =  async (req,res) => {
    const {id} = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}