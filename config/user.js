const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
        trim: true,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
        type: Date,
        required: false, // Set to true if you want it mandatory
        validate: {
            validator: function (value) {
                return value < new Date(); // DOB should be in the past
            },
            message: "Date of birth must be a past date."
        }
    },    
    promptContent: [
        {
            index: {
                type: Number,
                // required: true,
            },
            content: {
                type: String,
                required: true,
                // trim: true,
            }
        }
    ],
    profileImage: {
        type: String,
        default: "TechTribe_User_Profile_Avatar/Logos/Logo_b00c785c-9eae-43ca-b97b-4c12f4341344",
    },
    uploadedImages: {
        type: [String]
    },
    bio: {
        type: String,
        maxlength: 250
    },
    jobTitle: {
        type: String,
        trim: true,
        maxlength: 100
    },
    companyName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    school: {
        type: String,
        trim: true,
        maxlength: 100
    },
    livingIn: {
        type: String,
        trim: true,
        maxlength: 100
    },
    skills: {
        type: [String],
        default: []
    },
    socialLinks: {
        github: { 
            type: String, 
            trim: true, 
        },
        linkedin: { 
            type: String, 
            trim: true, 
        },
        portfolio: { 
            type: String, 
            trim: true, 
        }
    }
}, { timestamps: true }); // Adds 'createdAt' and 'updatedAt'

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    return await bcrypt.compare(passwordInputByUser, this.password);
};

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign({_id:user._id},"TECH@tribe$790" , {expiresIn : '1d'});
    return token;
}

const User = mongoose.model("User", userSchema);
module.exports = User;