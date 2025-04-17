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
        res.json({
            message: req.user.firstName + " is " + status + " in " + toUser.firstName ,
            data
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

        // Validate the status
        const allowedStatus = ["accepted" , "rejected"];

        if(!allowedStatus.includes(status)){
            return res.status(400).send("Status not allowed !!");
        }

        

        const connectionRequest = await ConnectionRequestModel.findOne({
            fromUserId: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });

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
})

module.exports = requestRouter;