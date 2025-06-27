const express = require("express");
const {userAuth} = require("../middlewares/auth");
const { deleteSavedImages, deleteSingleImage, uploadAnImage, profileView, profileEdit } = require("../Controllers/profileControllers");
const profileRouter = express.Router();



profileRouter.post("/profile/delete/savedImages", userAuth, deleteSavedImages );

profileRouter.post("/profile/delete/image", userAuth, deleteSingleImage );

profileRouter.post("/profile/upload/image" , userAuth , uploadAnImage );

profileRouter.get("/profile/view" , userAuth , profileView );

profileRouter.patch("/profile/edit" , userAuth , profileEdit );

module.exports = profileRouter;