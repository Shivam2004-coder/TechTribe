const express = require("express");
const {userAuth} = require("../middlewares/auth");
const { requestSentToYourMatch, reviewTheStatusOfRequestReceivedOrSent } = require("../Controllers/requestControllers");
const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId" , userAuth , requestSentToYourMatch );

requestRouter.post("/request/review/:status/:requestId" , userAuth , reviewTheStatusOfRequestReceivedOrSent );

requestRouter.post("/request/click" , userAuth , );

module.exports = requestRouter;