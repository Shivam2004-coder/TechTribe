const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://shivamgit003:0QYEvDkR2d1dVcVW@namastecluster0.dvsn2.mongodb.net/techTribe0"
    )
};

module.exports = connectDB;