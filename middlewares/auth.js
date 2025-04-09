const jwt = require('jsonwebtoken');
const User = require("../config/user");

const userAuth = async (req,res,next) => {
    try{
        // Read the token from the request cookies
        const {token} = req.cookies;
        // if (!token) {
        //     throw new Error("Token not found!");
        // }
        if ( !token ) {
            return res.status(401).json({
                message: "Please Login !!",
            });
        }

        const decodedMessage = await jwt.verify(token , "TECH@tribe$790");

        const {_id} = decodedMessage;

        const user = await User.findById(_id);

        if (!user) {
            throw new Error("User Not found");
        }

        req.user = user;

        next();
    }
    catch(err){
        res.status(400).send("ERROR : "+err.message);
    }

    // Validate the user

    // Find the user


};

module.exports = {userAuth};