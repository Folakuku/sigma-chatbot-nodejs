require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocal = require("passport-local");
const path = require("path");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const User = require("./models/User");
const Character = require("./models/Character");

// loginCheck(passport);
passport.use(
  new passportLocal.Strategy(
    { usernameField: "username" },
    (username, password, done) => {
      User.findOne({ username }).then((user) => {
        if (!user) {
          return done();
        }

        bcrypt.compare(password, user.password, (error, isMatch) => {
          if (error) {
            throw error;
          }

          if (isMatch) {
            return done(undefined, user);
          }

          return done();
        });
      });
    }
  )
);

passport.serializeUser(({ id }, done) => done(undefined, id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
});

mongoose.connect(process.env.MONGODB_URI, {}).then(() => {
  console.log("Connected to MongoDB");
});

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "oneboy",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.use("/", authRoutes);
app.use("/chat", chatRoutes);

// Predefined Characters
const initCharacters = async () => {
  try {
    const count = await Character.countDocuments({ isPredefined: true });
    if (count === 0) {
      await Character.insertMany([
        {
          name: "Chuck the Clown",
          description:
            "A funny clown who tells jokes and entertains, always ready with a joke and entertainment. Be upbeat, silly, and include jokes in your responses.",
          isPredefined: true,
        },
        {
          name: "Sarcastic Pirate",
          description:
            "A pirate with a sharp tongue and a love for treasure, ready to share your tales of adventure. Use pirate slang, be witty, sarcastic, and mention your love for treasure and the sea.",
          isPredefined: true,
        },
        {
          name: "Professor Sage",
          description:
            "A wise professor knowledgeable about many subjects, sharing wisdom and knowledge. Be scholarly, thoughtful, and provide educational information in your responses.",
          isPredefined: true,
        },
        {
          name: "Yoda from star wars",
          description: "You are a master of the force and very wise.",
          isPredefined: true,
        },
      ]);
    }
  } catch (error) {
    console.log(error);
  }
};
initCharacters();

app.listen(process.env.PORT, () => {
  console.log(`Running on http://localhost:${process.env.PORT}`);
});
