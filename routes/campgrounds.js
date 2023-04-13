const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utilies/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

const Campground = require("../models/campground");

router
  .route("/")
  // Index
  .get(catchAsync(campgrounds.index))
  // Campground Submission
  .post(
    isLoggedIn,
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// New Campground Form
router.get("/new", campgrounds.renderNewForm);

router
  .route("/:id")
  // Shows Campground
  .get(catchAsync(campgrounds.showCampground))
  // Update Campground
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  // Delete Campground
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Edit Campground Form
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
