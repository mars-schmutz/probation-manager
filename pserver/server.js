const RedisStore = require("connect-redis").default;
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const { User } = require("./models/user");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
const passportLocal = require("passport-local");
const redis = require("redis");
const session = require("express-session");
dotenv.config();

const redisClient = redis.createClient();
redisClient.connect().then(() => {
    console.log("Connected to Redis...");
}).catch((err) => {
    console.log("Error connecting to Redis...");
    console.error(err);
});
const redisStore = new RedisStore({
    host: "localhost",
    port: 6379,
    client: redisClient,
})

const app = express();
const port = 8080;

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(morgan("combined"));
app.use(
    session({
        store: redisStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
        }
    })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASSWD}@127.0.0.1:27017/probation`).then(() => {
    console.log("Connected to MongoDB...");
}).catch((err) => {
    console.log("Error connecting to MongoDB...");
    console.error(err);
});

passport.use(new passportLocal.Strategy({
    username: "user",
    password: "passwd",
}, function(username, password, done) {
    User.findOne({
        username: username
    }).then((user) => {
        if (user) {
            user.verifyPassword(password).then((result) => {
                if (result) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            })
        } else {
            done(null, false);
        }
    }).catch((err) => {
        done(err);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }).then((user) => {
        done(null, user);
    }).catch((err) => {
        done(err);
    });
});

// Authenticate user
app.post('/login', passport.authenticate('local'), (req, res) => {
    console.log("User authenticated...");
    res.sendStatus(201);
});

// Create user
app.post('/register', (req, res) => {
    User.countDocuments({ username: req.body.user }).then((count) => {
        let count = false; // TODO: check countDocuments() docs & fix
        if (err) {
            console.error(`Error counting: ${err}`);
        } else if (count > 0) {
            console.log(`User ${req.body.user} already exists...`);
            res.sendStatus(409);
        } else {
            var user = new User({ username: req.body.user });
            user.setEncryptedPassword(req.body.passwd).then(() => {
                user.save().then(() => {
                    res.sendStatus(201);
                });
            });
        }
    });
})

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(port, () => {
    console.log(`Server started on port ${port}...`);
});
