const express = require('express');
const {userAuth} = require("../middlewares/auth");
const { saveTheUserMessageInContactCollections } = require('../Controllers/contactControllers');
const contactRouter = express.Router();

contactRouter.post('/contact/message', userAuth , saveTheUserMessageInContactCollections );

module.exports = contactRouter;
