const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("./src/utils/cloudinary");
require('dotenv').config();

// const fs = require('fs');
// const path = require('path');

// // Decode and write JSON file only if env is set
// if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
//     const filePath = path.join(__dirname, 'secrets', 'google-service-account.json');

//     // Ensure the secrets directory exists
//     fs.mkdirSync(path.dirname(filePath), { recursive: true });

//     // Write the file from base64
//     fs.writeFileSync(
//         filePath,
//         Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8')
//     );

//     // Set the environment variable so Google Vision SDK can use it
//     process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;
// }


// require("./src/utils/cronjob");

const http = require("http");

const allowedOrigins = [
  'https://techtribe-f.onrender.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.options('*', cors());



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


const path = require("path");

// Serve static files from the frontend (React build)
app.use(express.static(path.join(__dirname, "dist")));

// For any other route not handled by your API, return the frontend app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


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
