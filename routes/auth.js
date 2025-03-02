const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const router = express.Router();

router.get("/", (req, res) => res.render("signup", { user: req.user }));
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
// router.post("/signup", async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const existingUser = await User.findOne({ username });
//     const user = new User({ username, password });
//     await user.save();
//     // req.login(user, () => res.redirect("/chat"));
//     req.login(user, function (err) {
//       if (err) {
//         console.log(err);
//         return next(err);
//       }
//       res.redirect("/chat");
//     });
//   } catch (err) {
//     res.redirect("/signup");
//   }
// });

router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // First check if user exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // If user exists, attempt to log them in
      passport.authenticate("local", {
        successRedirect: "/chat",
        failureRedirect: "/login",
        failureFlash: true,
      })(req, res, next);
    } else {
      // If user doesn't exist, create new user
      const user = new User({ username, password });
      await user.save();

      req.login(user, (err) => {
        if (err) {
          console.error("Login error after signup:", err);
          return next(err);
        }
        res.redirect("/chat");
      });
    }
  } catch (err) {
    console.error("Signup error:", err);
    // Redirect to signup with error message
    req.flash("error", "An error occurred during signup");
    res.redirect("/signup");
  }
});

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
