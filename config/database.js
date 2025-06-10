const mongoose = require("mongoose");

const connectDB = async () => {
    console.log("Connecting to MongoDB..." + process.env.DB_CONNECTION_SECRET);
    await mongoose.connect(process.env.DB_CONNECTION_SECRET);
};

module.exports = connectDB;