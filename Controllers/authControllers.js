const { oauth2Client } = require("../config/googleConfig");
const axios = require('axios');
const User = require("../models/user");
const { validateSignUpData } = require("../src/utils/validation");
const bcrypt = require("bcrypt");


exports.manualSignUp = async (req, res) => {
    try {
  
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
    
        const token = await savedUser.getJWT();
    
        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 360000),
        });
    
        return res.status(200).json({ 
            message: "User Added Successfully !!", 
            token
        });
  
    } catch (err) {
        //   console.error("Signup error:", err.message);
        
        return res.status(400).json({
            message: "Cannot Sign Up. Please Try Again !!"
        });
    }
}
exports.manualSignIn = async (req,res) => {
    try{
        // console.log("Login request received:", req.body); // Debug log
        const {emailId , password } = req.body;

        const user = await User.findOne({emailId : emailId});
        if (!user) {
            return res.status(500).json({
                message: "Invalid Credentials !!"
            });
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
    
                res.status(200).json({
                    message: "You are successfully Logged In",
                    token
                });
            })
            .catch((err) => {
                res.status(400).json({
                    message: "JWT token is not created !!"
                });
            })
        }
        else{
            res.status(400).json({
                message: "Password is not Valid !!",
            });
        }

    }
    catch(err){
        console.log("ERR : "+err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}
exports.googleSignIn = async (req, res) => {
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        const { email } = userRes.data;
        let user = await User.findOne({ email });
        if (user) {

            // Create a JWT token
            const token = user.getJWT();
            token.then((token)=>{
    
                res.cookie("token" , token , {
                    expires: new Date(Date.now() + 8 * 360000),
                });
    
                res.status(200).json({
                    message: 'You are successfully Logged-In',
                    token,
                    user,
                });
            })
            .catch((err) => {
                console.log("ERROR In googleSignIn route controller inside TRY-CATCH if block : "+err.message);
                res.status(400).json({
                    message: "JWT token is not created !!"
                });
            })
        }
        else{
            console.log("ERROR In googleSignIn route controller inside TRY-CATCH else block : ");
            res.status(401).json({
                message: "This Google account is not linked to any existing account. Please sign up first or use the email and password you registered with.",
            });
        }
    } catch (err) {
        console.log("ERROR In googleSignIn route controller inside CATCH block : "+err.message);
        res.status(500).json({
            message: "Internal Server Error",
        })
    }
} 
exports.manualSignOut = async (req,res) => {
    res.cookie("token" , null ,{
        expiresIn : new Date(Date.now()),
    });

    res.send("Logout Successfull !!!");
}