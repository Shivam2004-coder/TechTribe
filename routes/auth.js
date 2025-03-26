const express = require("express");
const User = require("../config/user");
const { validationSignUpData } = require("../src/utils/validation");
const bcrypt = require("bcrypt");
// const jwt = require('jsonwebtoken');

const authRouter = express.Router();

authRouter.post("/signup" , async (req,res) => {
    try{
        console.log(req.body);

        // validation of our data...
        validationSignUpData(req);

        const {firstName , lastName , emailId , password , age , gender , favouriteItems} = req.body;

        // encrypting our password
        const passwordHash = bcrypt.hash(password , 10);
        
        passwordHash.then( async (passwordHash) => {
                // creating an instance of our User Model...
                const user = new User({
                    firstName ,
                    lastName ,
                    emailId,
                    password:passwordHash,
                    age,
                    gender,
                    favouriteItems
                });
                await user.save();
                res.send("User Added Successfully !!");
            })

    }
    catch(err){
        res.status(400).send("Error saving the user : "+ err.message);
    }

});

authRouter.post("/login" , async (req,res) => {
    try{
        // console.log("Login request received:", req.body); // Debug log
        const {emailId , password } = req.body;

        const user = await User.findOne({emailId : emailId});
        if (!user) {
            throw new Error("Email id is not present !!");
        }

        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {

            // Create a JWT token
            const token = user.getJWT();
            token.then((token)=>{
                console.log("Here it is : "+token);
    
                res.cookie("token" , token);
    
                res.send("Login Successfull!!");
            })
            .catch((err) => {
                res.status(400).send("JWT token is not created !!");
            })
        }
        else{
            res.send("Password is not Valid !!");
        }

    }
    catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
});

authRouter.post("/logout" , async (req,res) => {
    res.cookie("token" , null ,{
        expiresIn : new Date(Date.now()),
    });

    res.send("Logout Successfull !!!");
});


module.exports = authRouter;