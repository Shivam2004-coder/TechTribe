const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
        index: true
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2,
        trim: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    age: {
        type: Number,
        min: 1,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },
    favouriteItems: {
        type: [String],  // Array of strings for favorite items
        default: []
    }
});

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser , passwordHash);
    return isPasswordValid;
}

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign({_id:user._id},"TECH@tribe$790" , {expiresIn : '1d'});
    return token;
}

const User = mongoose.model("User" , userSchema);

module.exports = User;