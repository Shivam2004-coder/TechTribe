const express = require('express');
const {userAuth} = require("../middlewares/auth");
const { chatInfo } = require('../Controllers/chatControllers');


const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId', userAuth , chatInfo );

module.exports =  chatRouter;