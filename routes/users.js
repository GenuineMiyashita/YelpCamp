const express = require("express");
const router = express.Router();
const User = require("../models/user");
const users = require("../controllers/users");
const catchAsync = require("../utilies/catchAsync");
const passport = require("passport");

router
  .route("/register")
  // Register Form
  .get(users.renderRegister)
  // Registration Logic
  .post(catchAsync(users.register));

router
  .route("/login")
  // Login Form
  .get(users.renderLogin)
  // Login Logic
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

// Logout Logic
router.get("/logout", users.logout);

module.exports = router;
