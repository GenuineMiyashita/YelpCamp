const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilies/ExpressError');
const methodOverrride = require('method-override');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// Home Route
app.get('/', (req, res) => {
    res.render('home')
});

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