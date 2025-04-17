const express = require("express");
const User = require("../models/user");
const { validateSignUpData } = require("../src/utils/validation");
const bcrypt = require("bcrypt");
// const jwt = require('jsonwebtoken');

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
      console.log(req.body);
  
      // validation of our data...
      validateSignUpData(req);
  
      const { firstName, lastName, emailId, password } = req.body;
  
      // encrypting our password
      const passwordHash =  await bcrypt.hash(password, 10);
  
      // creating an instance of our User Model...
      const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
      });
  
      const savedUser = await user.save();
      console.log("User Saved successfully");
  
      const token = await savedUser.getJWT();
  
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 360000),
      });
  
      return res.json({ message: "User Added Successfully !!", data: savedUser });
  
    } catch (err) {
      console.error("Signup error:", err.message);
      return res.status(400).send("Error saving the user: " + err.message);
    }
});  

// authRouter.post("/signup" , async (req,res) => {
//     try{
//         console.log(req.body);

//         // validation of our data...
//         validateSignUpData(req);

//         const {firstName , lastName , emailId , password } = req.body;

//         // encrypting our password
//         const passwordHash = bcrypt.hash(password , 10);
        
//         passwordHash.then( async (passwordHash) => {
//                 // creating an instance of our User Model...
//                 const user = new User({
//                     firstName ,
//                     lastName ,
//                     emailId,
//                     password:passwordHash,
//                 });
//                 const savedUser = await user.save();
//                 // Create a JWT token
//                 console.log("User Saved successfully");
//                 const token = savedUser.getJWT();
//                 token.then((token)=>{
//                     res.cookie("token" , token , {
//                         expires: new Date(Date.now() + 8 * 360000),
//                     });
        
//                     // res.send(user);
//                 })
//                 .catch((err) => {
//                     res.status(400).send("JWT token is not created !!");
//                 })
//                 res.json({message : "User Added Successfully !!" , data: savedUser});
//             })

//     }
//     catch(err){
//         res.status(400).send("Error saving the user : "+ err.message);
//     }

// });

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
    
                res.cookie("token" , token , {
                    expires: new Date(Date.now() + 8 * 360000),
                });
    
                res.send(user);
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