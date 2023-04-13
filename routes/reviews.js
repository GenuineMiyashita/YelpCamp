const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground");
const Review = require("../models/review.js");
const reviews = require("../controllers/reviews");
const ExpressError = require("../utilies/ExpressError");
const catchAsync = require("../utilies/catchAsync");

// Submit Review
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
