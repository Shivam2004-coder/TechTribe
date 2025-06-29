const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("./src/utils/cloudinary");
require('dotenv').config();

// require("./src/utils/cronjob");

const http = require("http");

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// app.use(express.json());
app.use(express.json({ limit: "100mb" })); // or higher
app.use(cookieParser());
// Increase request body size limit

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/users");
const chatRouter = require("./routes/chat");
const paymentRouter = require("./routes/payment");
const contactRouter = require("./routes/contact");
const initializeSocket = require("./src/utils/sockets");

app.use("/" , authRouter);
app.use("/" , profileRouter);
app.use("/" , requestRouter);
app.use("/" , userRouter);
app.use("/" , chatRouter);
app.use("/" , paymentRouter);
app.use("/" , contactRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
    .then(() => {
        console.log("Database connection established ......");
        const PORT = process.env.PORT || 3000;
        server.listen( PORT , () => {
            console.log("It is listening on port 3000");
        });
    })
    .catch((err) => {
        console.log("Database cannot be established!");
    });
