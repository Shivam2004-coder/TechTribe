const ConnectionRequestModel = require("../models/connectionRequestSchema");
const User = require("../models/user");

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

} ;

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
}

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
            hideUsersFromFeed.add(req.fromUserId);
            hideUsersFromFeed.add(req.toUserId);
        });

        console.log(hideUsersFromFeed);

        let users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } },
                { _id: { $ne: loggedInUser._id } },
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
}