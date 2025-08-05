const express = require("express");
const { googleSignIn, manualSignUp, manualSignIn, manualSignOut } = require("../Controllers/authControllers");

const authRouter = express.Router();


authRouter.post("/signup", manualSignUp );  

authRouter.get("/auth/google" , googleSignIn );

authRouter.post("/login" , manualSignIn );

authRouter.post("/logout" , manualSignOut );

module.exports = authRouter;

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
