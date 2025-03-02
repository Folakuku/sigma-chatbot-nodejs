// require("dotenv").config();
// const express = require("express");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const bcrypt = require("bcrypt");
// const mongoose = require("mongoose");
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const path = require("path");
// const authRoutes = require("./routes/auth");
// const chatRoutes = require("./routes/chat");
// const User = require("./models/User");
// const Character = require("./models/Character");

// const app = express();

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI, {});

// // Middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.set("view engine", "ejs");
// app.use(express.static(path.join(__dirname, "public")));
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     // resave: false,
//     resave: true,
//     saveUninitialized: true,
//     // store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());
// // app.use(function (req, res, next) {
// //   var msgs = req.session.messages || [];
// //   res.locals.messages = msgs;
// //   res.locals.hasMessages = !!msgs.length;
// //   req.session.messages = [];
// //   next();
// // });

// // Passport Config
// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const user = await User.findOne({ username });
//       if (!user) {
//         console.log("!User");
//         return done(null, false, { message: "Incorrect username." });
//       }
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         console.log("!Match");
//         return done(null, false, { message: "Incorrect password." });
//       }
//       console.log("User logged in");
//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   })
// );
// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById();
//     return done(null, user);
//   } catch (error) {
//     return done(error, null);
//   }
// });

// // Routes
// app.use("/", authRoutes);
// app.use("/chat", chatRoutes);

// // Predefined Characters
// const initCharacters = async () => {
//   const count = await Character.countDocuments({ isPredefined: true });
//   if (count === 0) {
//     await Character.insertMany([
//       { name: "Alex", personality: "Witty and sarcastic", isPredefined: true },
//       { name: "Emma", personality: "Kind and helpful", isPredefined: true },
//     ]);
//   }
// };
// initCharacters();

// app.listen(process.env.PORT, () =>
//   console.log(`Server running on port ${process.env.PORT}`)
// );
