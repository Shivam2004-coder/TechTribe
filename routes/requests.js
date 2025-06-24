const express = require("express");
const {userAuth} = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequestSchema");
const User = require("../models/user");
const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId" , userAuth , async (req,res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored" , "interested"];

        if( !allowedStatus.includes(status) ){
            res.status(400).json({ message: "Invalid status type : " + status });
        }

        // Checking if user is in the Database
        const toUser = await User.findById(toUserId);
        if ( !toUser ) {
            return res.status(404).json({
                message: "User not Found !!",
            });
        }

        // If there is an existing connectionRequest
        const existingConnectionRequest = await ConnectionRequestModel.findOne({
            $or: [
                {fromUserId , toUserId},
                {fromUserId: toUserId , toUserId: fromUserId }
            ]
        });

        if ( existingConnectionRequest ) {
            return res.status(400).json({ message: "Connection Request Already Exists !!" });
        }


        const connectionRequest = new ConnectionRequestModel({
            fromUserId,
            toUserId,
            status,
        });
        
        const data = await connectionRequest.save();

        // ✅ Increment swipe count
        req.user.swipes = (req.user.swipes || 0) + 1;
        await req.user.save();

        return res.status(200).json({
            message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
            connectionData: data,
            swipes: req.user.swipes
        });
    } 
    catch (error) {
        res.status(400).send("ERROR : "+error.message);
    }

});

requestRouter.post("/request/review/:status/:requestId" , userAuth , async (req,res) => {
    try {
        const loggedInUser = req.user;
        const {status , requestId} = req.params;
        // console.log("I am in the request review route !!");
        // console.log("LoggedIn User : "+loggedInUser._id);
        // console.log("Requested User : "+requestId);
        // console.log("Status: "+status);
        

        // Validate the status
        const allowedStatus = ["accepted" , "rejected" , "ignored" , "interested"];

        if(!allowedStatus.includes(status)){
            return res.status(400).send("Status not allowed !!");
        }

        

        // const connectionRequest = await ConnectionRequestModel.findOne({
        //     fromUserId: requestId,
        //     toUserId: loggedInUser._id,
        //     status: "interested"
        // });

        const connectionRequest = await ConnectionRequestModel.findOne({
            $or: [
                {
                    fromUserId: requestId,
                    toUserId: loggedInUser._id
                },
                {
                    fromUserId: loggedInUser._id,
                    toUserId: requestId
                }
            ],
            // status: { $in: ["interested", "accepted"] }
        });

        console.log("I am in the request review route !!");
        console.log("connection : "+connectionRequest);


        if (!connectionRequest) {
            return res.status(404).json({
                message: "Connection request not found!"
            });
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.json({
            message: "Connection request " + status , data
        });
        // loggedInId ==== UserId
        // status = interested
        // request Id should be valid

    } 
    catch (err) {
        res.status(400).send("ERROR : "+err.message);
    }
});

requestRouter.post("/request/click" , userAuth , async (req,res) => {
    try {
        const loggedInUser = req.user;
        const swipes = loggedInUser.swipes;
        
        loggedInUser.swipes = (swipes || 0) + 1; + 1;
        await loggedInUser.save();
        res.status(200).json({
            message: "Number of swipes increased",
            data: swipes + 1
        });
    }
    catch (err) {
        res.status(400).send("ERROR : "+err.message);
    }
});

module.exports = requestRouter;