const express = require('express');
const {userAuth} = require("../middlewares/auth");
const {Chat} = require("../models/chat");
const ConnectionRequestModel = require("../models/connectionRequestSchema");

const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId', userAuth , async (req, res) => {
    const { targetUserId } = req.params;

    const loggedInUser = req.user;

    try {
        // Check if the target user is valid and not the same as the logged-in user
        if (!targetUserId || targetUserId === loggedInUser._id.toString()) {
            return res.status(400).json({ message: 'Invalid target user ID' });
        }
        
        // If there is an existing connectionRequest
        const existingConnectionRequest = await ConnectionRequestModel.findOne({
            $or: [
                {fromUserId: targetUserId , toUserId: loggedInUser._id , status: 'accepted'},
                {fromUserId: loggedInUser._id , toUserId: targetUserId , status: 'accepted'}
            ]
        });

        if(!existingConnectionRequest) {
            return res.status(400).json({ message: "Connection Request Not Accepted Yet !!" });
        }

        let chat = await Chat.findOne({
            participants: { $all: [loggedInUser._id , targetUserId] },
        }).populate({ 
            path: 'messages.senderId', 
            select: 'firstName lastName'
        });
        if (!chat) {
            chat = new Chat({
                participants: [loggedInUser._id , targetUserId],
                messages: [],
            });
            await chat.save();
        }
        res.json(chat);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }   

});

module.exports =  chatRouter;