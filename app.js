const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const catchAsync = require('./utilies/catchAsync');
const ExpressError = require('./utilies/ExpressError');
const methodOverrride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review.js');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverrride('_method'));

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

// Validates New Review
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Home Route
app.get('/', (req, res) => {
    res.render('home')
});

// Campground Route
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// New Campground Route
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// New Campground Submission Route
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
     const campground = new Campground(req.body.campground);
     await campground.save();
     res.redirect(`/campgrounds/${campground._id}`)
}));

// Render Specific Campground Route
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

// Edit Specific Campground Route
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

// Submit Edited Campground Route
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}));

// Delete Specific Campground Route
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// Submit Campground Review Route
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));


// Catch-all Error Route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}); 

// Error Route Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
});