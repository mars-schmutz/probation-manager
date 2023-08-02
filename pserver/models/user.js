const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// make sure it's necessary
// mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASSWD}@127.0.0.1:27017/probation`).then(() => {
//     console.log("Connected to MongoDB...");
// }).catch((err) => {
//     console.log("Error connecting to MongoDB...");
//     console.error(err);
// });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    encryptedPassword: {
        type: String,
        required: true
    },
});

userSchema.methods.setEncryptedPassword = function(plain_pass) {
    let promise = new Promise((resolve, reject) => {
        bcrypt.hash(plain_pass, 12).then((hash) => {
            this.encryptedPassword = hash;
            resolve();
        });
    });

    return promise;
}

userSchema.methods.verifyPassword = function(plain_pass) {
    let promise = new Promise((resolve, reject) => {
        bcrypt.compare(plain_pass, this.encryptedPassword).then((result) => {
            resolve(result);
        });
    });

    return promise;
}

const User = mongoose.model("User", userSchema);

module.exports = {
    User: User
};