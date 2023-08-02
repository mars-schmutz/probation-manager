const RedisStore = require("connect-redis").default;
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const redis = require("redis");
const session = require("express-session");

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
dotenv.config();

mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASSWD}@127.0.0.1:27017/probation`).then(() => {
    console.log("Connected to MongoDB...");
}).catch((err) => {
    console.log("Error connecting to MongoDB...");
    console.error(err);
});

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

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(port, () => {
    console.log(`Server started on port ${port}...`);
});
