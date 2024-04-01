const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req,res) => {
    const campgrounds =  await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req,res, next) =>{
    const geoData = await geocoder.forwardGeocode({
      // query: 'Annapolis, Maryland',
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground' );
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    .populate(
        {
         path: 'reviews',
         populate: {
             path: 'author'
         }
    })
    .populate('author');
    //console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find that campground! ');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
    console.log(campground);

}

module.exports.renderEditForm = async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', 'Cannot find that campground! ');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampgrounds = async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); 
    campground.images.push(...imgs);
    await campground.save();

    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy();
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages }}}})
    }
    // //if(!campground.author.equals(req.user._id)){
    //         req.flash('error', 'You do not have permission');
    //         return res.redirect(`/campgrounds/${id}`);
    // /}
    //const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.delete = async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted campground');
    res.redirect('/campgrounds');
}