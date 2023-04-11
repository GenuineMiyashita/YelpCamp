const express = require('express');
const router = express.Router();
const catchAsync = require('../utilies/catchAsync');
const { campgroundSchema } = require('../schemas.js')
const ExpressError = require('../utilies/ExpressError');
const Campground = require('../models/campground');

// Validates New Campground
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Campground Route
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// New Campground Route
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

// New Campground Submission Route
router.post('/', validateCampground, catchAsync(async (req, res) => {
     const campground = new Campground(req.body.campground);
     await campground.save();
     req.flash('success', 'Successfully made a new campground!')
     res.redirect(`/campgrounds/${campground._id}`)
}));

// Show Specific Campground Route
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

// Edit Specific Campground Route
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

// Submit Edited Campground Route
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}));

// Delete Specific Campground Route
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

module.exports = router;