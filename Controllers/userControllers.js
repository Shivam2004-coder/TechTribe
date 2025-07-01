require('dotenv').config(); // Must be here if this is the entry
const ConnectionRequestModel = require("../models/connectionRequestSchema");
const { Chat } = require("../models/chat");
const Contact = require("../models/contact");
const User = require("../models/user");
const DeletedUserFeedback = require('../models/DeletedUserFeedback');
const cloudinary = require("../src/utils/cloudinary");
const avatars = process.env.AVATAR_LINKS.split(",");

const USER_SAFE_DATA = [ 
    "firstName" , 
    "lastName" , 
    "dateOfBirth" , 
    "gender" , 
    "promptContent" , 
    "livingIn" , 
    "profileImage" , 
    "uploadedImages" , 
    "bio" , 
    "jobTitle" , 
    "companyName" , 
    "school", 
    "skills" , 
    "socialLinks" , 
    "membershipType" ,
    "membershipExpiresAt",
    "chatThemeImage",
    "wallpaperImage",
    "displayMode"
];

exports.usersReceivedRequest = async (req,res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId" , USER_SAFE_DATA );

        res.json({
            message: "Data fetched Successfully",
            data: connectionRequests
        })

    } catch (error) {
        res.status(400).send("ERROR : "+error.message);
    }

};

exports.usersSentRequestStatus = async (req , res) => {
    try {
        const loggedInUser = req.user;
        const status = req.params.status;

        const connectionRequests = await ConnectionRequestModel.find({
            fromUserId: loggedInUser._id,
            status: status
        }).populate("toUserId" , USER_SAFE_DATA );

        res.json({
            message: "Data fetched Successfully",
            data: connectionRequests
        })

    } catch (error) {
        res.status(400).send("ERROR : "+error.message);
    }
};

exports.usersRequestConnection = async (req , res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequestModel.find({
            $or: [
                { toUserId: loggedInUser._id , status: "accepted" },
                { fromUserId: loggedInUser._id , status: "accepted" }
            ],
        })
            .populate("fromUserId" , USER_SAFE_DATA )
            .populate("toUserId" , USER_SAFE_DATA );

        const data = connectionRequests.map((row) =>{
            if ( row.fromUserId._id.toString() === loggedInUser._id.toString() ) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({
            data
        })
        
    } catch (error) {
        res.status(400).json({
            message: err.message
        })
    }
};

exports.usersFeed = async(req,res) => {
    try {
        // User should see all the user cards except
        // 0. His own card
        // 1. His connections
        // 2. Ignored people
        // 3. Already sent the connection request

        const loggedInUser = req.user;

        // const page = parseInt(req.query.page) || 1;
        // let limit = parseInt(req.query.limit) || 10;
        // limit = limit > 50 ? 50 : limit;
        // const skip = (page - 1) * limit;

        // Find all the connection request (sent + received)

        const connectionRequests = await ConnectionRequestModel.find({
            $or: [
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId status").populate("fromUserId" , ["firstName"]).populate("toUserId" , ["firstName"]);

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req) => {
            hideUsersFromFeed.add(String(req.fromUserId._id || req.fromUserId));
            hideUsersFromFeed.add(String(req.toUserId._id || req.toUserId));
        });

        console.log(hideUsersFromFeed);

        let users = await User.find({
        $and: [
            { _id: { $nin: Array.from(hideUsersFromFeed) } },
            { _id: { $ne: loggedInUser._id } },
            { uploadedImages: { $exists: true, $ne: [], $not: { $size: 0 } } },
            { dateOfBirth: { $exists: true, $ne: "" } },
            { livingIn: { $exists: true, $ne: "" } },
            { bio: { $exists: true, $ne: "" } },
            { skills: { $exists: true, $not: { $size: 0 } } }
        ],
        })
        .select(USER_SAFE_DATA);


        // Sort users: 
        // 1. Elite first
        // 2. Among Elites, later membershipExpiresAt first
        users.sort((a, b) => {
            const isEliteA = a.membershipType === "Elite";
            const isEliteB = b.membershipType === "Elite";

            if (isEliteA && !isEliteB) return -1;
            if (!isEliteA && isEliteB) return 1;

            if (isEliteA && isEliteB) {
                const dateA = new Date(a.membershipExpiresAt || 0);
                const dateB = new Date(b.membershipExpiresAt || 0);
                return dateB - dateA; // Farther expiry comes first
            }

            // Otherwise keep as is (same priority)
            return 0;
        });

        // Now apply pagination AFTER sorting
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const paginatedUsers = users.slice(skip, skip + limit);

        res.status(200).json({
            paginatedUsers,
            message: "User Feed Fetched Successfully"
        });

    } catch (error) {
        res.status(404).json({
            message: error.message,
        });
    }
};

exports.deleteUserAccount = async(req,res) => {
    try {
        const loggedInUser = req.user;
        const { reason } = req.body;
        const { 
            _id ,
            profileImage ,
            uploadedImages 
        } = loggedInUser;


        // Save metadata before deletion
        await DeletedUserFeedback.create({
            reason,
            metadata: {
                membershipType: loggedInUser.membershipType,
                gender: loggedInUser.gender,
                swipesCount: loggedInUser.swipes || 0,
                age: loggedInUser.dateOfBirth
                ? Math.floor((Date.now() - new Date(loggedInUser.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365))
                : undefined,
            },
        });

        // Deleting the profile image if the user has uploaded it.
        const isThisUsersUploadedProfileImage = (publicId) => {
            return publicId !== '' || !avatars.includes(publicId) || publicId !== process.env.DEFAULT_PROFILE_IMAGE;   
        };

        if( isThisUsersUploadedProfileImage( profileImage ) ){
            const result = await cloudinary.uploader.destroy(profileImage);
            if (result.result !== "ok") {
                return res.status(500).json({ error: "Failed to delete image from Cloudinary." });
            }
        }

        // Deleting the users Uploaded Images.
        for (const publicId of uploadedImages) {
            const result = await cloudinary.uploader.destroy(publicId);
            if (result.result !== "ok") {
                return res.status(500).json({ error: "Failed to delete image from Cloudinary." });
            }
        }


        // Deleting from the connections request with help of userId.
        // Delete connection requests (from or to this user)
        await ConnectionRequestModel.deleteMany({
        $or: [
            { fromUserId: _id },
            { toUserId: _id }
        ]
        });

        // Deleting all it's chats with the help of userId.
        // Delete chats containing this user as a participant
        await Chat.deleteMany({
        participants: _id
        });


        // Deleting from the contact messages with the help of userId.
        await Contact.deleteMany({ userId: _id });


        // ✅ 6. Delete user document
        await User.findByIdAndDelete(_id);

        return res.status(200).json({
            message: "User account and associated data deleted successfully."
        });    
    } 
    catch (error) {
        console.error("Error deleting account:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};