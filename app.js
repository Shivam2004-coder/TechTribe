const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("./src/utils/cloudinary");
require('dotenv').config();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/users");

app.use("/" , authRouter);
app.use("/" , profileRouter);
app.use("/" , requestRouter);
app.use("/" , userRouter);

connectDB()
    .then(() => {
        console.log("Database connection established ......");
        app.listen(process.env.PORT , () => {
            console.log("It is listening on port 3000");
        });
    })
    .catch((err) => {
        console.log("Database cannot be established!");
    });
