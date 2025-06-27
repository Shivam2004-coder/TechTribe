const express = require("express");
const userRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const { usersReceivedRequest, usersSentRequestStatus, usersRequestConnection, usersFeed } = require("../Controllers/userControllers");

// Get all the pending connection requests for the loggedIn User
userRouter.get("/user/requests/received" , userAuth , usersReceivedRequest );

// Get all the sent request based on the status
userRouter.get("/user/sent/requests/:status" , userAuth , usersSentRequestStatus );

userRouter.get("/user/requests/connections" , userAuth , usersRequestConnection );

userRouter.get("/user/feed" , userAuth , usersFeed );

module.exports = userRouter;