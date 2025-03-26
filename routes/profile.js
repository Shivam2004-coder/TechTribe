const express = require("express");
const {userAuth} = require("../middlewares/auth");
const {validateEditProfileData} = require("../src/utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile/view" , userAuth , async (req,res) => {
    try{
        const user = req.user;

        res.send("cookie reading !!");
    }
    catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
});

profileRouter.patch("/profile/edit" , userAuth , async (req,res) => {
    try{
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request !!");
        }
    
        const loggedInUser = req.user;
    
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    
        await loggedInUser.save();
    
        res.json({
            message: `${loggedInUser.firstName} , your profile updated successfully !!`,
            data: loggedInUser,
        });
    }
    catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
});

module.exports = profileRouter;