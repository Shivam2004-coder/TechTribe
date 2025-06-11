const mongoose = require("mongoose");

const connectDB = async () => {
    const MONGO_URI = process.env.DB_CONNECTION_SECRET;
    await mongoose.connect(MONGO_URI);
};

module.exports = connectDB;