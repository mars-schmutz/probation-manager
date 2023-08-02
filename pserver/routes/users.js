const express = require("express");
const passport = require("passport");
const router = express.Router();
const { User } = require("../models/user");

// Authenticate user
router.post('/login', passport.authenticate('local'), (req, res) => {
    console.log("User authenticated...");
    res.sendStatus(201);
});

// Create user
router.post('/register', (req, res) => {
    User.countDocuments({ username: req.body.user }).then((count) => {
        let err = false; // TODO: check countDocuments() docs & fix
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
});

module.exports = router;