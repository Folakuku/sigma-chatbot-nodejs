const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const router = express.Router();

router.get("/login", (req, res) => res.render("login", { user: req.user }));
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/chat",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/signup", (req, res) => res.render("signup", { user: req.user }));
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    req.login(user, () => res.redirect("/chat"));
  } catch (err) {
    res.redirect("/signup");
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
