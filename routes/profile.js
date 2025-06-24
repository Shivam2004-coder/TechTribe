const express = require("express");
const {userAuth} = require("../middlewares/auth");
const {validateEditProfileData} = require("../src/utils/validation");
const cloudinary = require("../src/utils/cloudinary");
const { v4: uuidv4 } = require('uuid'); // At the top
require('dotenv').config(); // Must be here if this is the entry

const profileRouter = express.Router();

// const avatars = [
//     "/boyAvatar1.jpg", "/boyAvatar2.jpg", "/boyAvatar3.jpg", "/boyAvatar4.jpg", "/boyAvatar5.jpg",
//     "/girlAvatar1.jpg", "/girlAvatar2.jpg", "/girlAvatar3.jpg", "/girlAvatar4.jpg", "/girlAvatar5.jpg",
//     "/boyAvatar6.jpg", "/boyAvatar7.jpg", "/boyAvatar8.jpg", "/boyAvatar9.jpg", "/boyAvatar10.jpg",
//     "/girlAvatar6.jpg", "/girlAvatar7.jpg", "/girlAvatar8.jpg", "/girlAvatar9.jpg", "/girlAvatar10.jpg"
//   ];

// const avatars = [
//     "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_a83fe293-40ae-458d-8423-83bfec78dbbb", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_424fc5f1-b325-4461-bac7-749391c70640", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_b833471e-8f1b-4fc7-82b0-caec4f8f7fee", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_1f1c6672-b72b-4fab-8a79-157cf8c6ba64", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_0428dab3-deaa-406c-bb8d-3668b7254f5c",
//     "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_67c7b66f-a0ea-4d3d-83de-b82b60bb3a6a", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_2c0a0add-4ac5-4d5f-8d3d-8e20f65e8843", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_3768c636-04a3-4b48-ba94-7d5a8c509215", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_a4ff64eb-c36a-4684-9f83-0f20799d01ab", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_6a4beb85-460e-4b2a-b497-90d3e0373e9b",
//     "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_e52def3d-88f5-40b1-af92-2d31433a2470", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_4b337dcf-585b-4ea0-b042-120ba44797a3", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_3fe8eb1e-53f4-4577-892d-e05a8ca7a1b3", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_b5e6fc47-4a17-4e1d-895c-7a267c3bf0d8", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_3ff93015-921c-4d0f-b91c-e9b7ac8d6075",
//     "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_f1fa0783-1d0a-4b2b-a06b-dae8f8630d30", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_4b403519-a155-44b1-a661-5782fb3131f2", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_8bce3b20-1027-4453-b192-8d11d9b9e28b", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_702fc626-627a-41ad-b9b3-e2198d16a68f", "TechTribe_User_Profile_Avatar/User_Avatars/Profile_avatar_4c0cf563-3ad3-4736-9078-b68204a3b985"
// ];

const avatars = process.env.AVATAR_LINKS.split(",");

profileRouter.post("/profile/delete/savedImages", userAuth, async (req, res) => {
    try {
        const { uploadedImages , profileImage } = req.body;
        const loggedInUser = req.user;
        const currentUploadedImages = loggedInUser.uploadedImages;
        const userProfileImage = loggedInUser.profileImage;

        if ( profileImage !== process.env.DEFAULT_PROFILE_IMAGE && !avatars.includes(profileImage) && profileImage !== userProfileImage  ) {
            await cloudinary.uploader.destroy(profileImage);
        }

        // Find images to delete
        const imagesToDelete = currentUploadedImages.filter(img => !uploadedImages.includes(img));

        // Delete images from Cloudinary
        for (const publicId of imagesToDelete) {
            await cloudinary.uploader.destroy(publicId);
        }

        res.status(200).json({ message: "Deleted unused images successfully." });
    } catch (error) {
        console.error("Error deleting images:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

profileRouter.post("/profile/delete/image", userAuth, async (req, res) => {
    try {
        const { publicId , isProfile } = req.body;

        if (!publicId) {
            return res.status(400).json({ error: "publicId is required to delete the image." });
        }
        
        const loggedInUser = req.user;
        const currentUploadedImages = loggedInUser.uploadedImages;
        const profileImage = loggedInUser.profileImage;

        const isAvatar = (publicId) => {
            if (isProfile) {
                return avatars.includes(publicId) || publicId === "TechTribe_User_Profile_Avatar/Logos/Logo_b00c785c-9eae-43ca-b97b-4c12f4341344";   
            }
            return !currentUploadedImages.includes(publicId);
        };

        // console.log("I am in image delete route!!");
        // console.log("UploadedImages: "+currentUploadedImages);
        // console.log("publblicId : "+publicId);
        // console.log("isProfile : "+isProfile);
        // console.log("ProfileImage : "+ profileImage);
        // console.log("avatars.includes(publicId) : "+avatars.includes(publicId));
        if (!isAvatar(publicId)) {
        
            console.log(publicId);

            const result = await cloudinary.uploader.destroy(publicId);
    
            if (result.result !== "ok") {
                return res.status(500).json({ error: "Failed to delete image from Cloudinary." });
            }
            console.log("After Image deletion !!");
            console.log(result);
        }

        res.status(200).json({ message: "Image deleted successfully." });

    } catch (error) {
        console.error("Image delete error:", error);
        res.status(500).json({ error: "Internal server error while deleting image." });
    }
});

profileRouter.post("/profile/upload/image" , userAuth , async (req , res) => {
    try {
        const {image , isProfile} = req.body;

        const loggedInUser = req.user;
        console.log("I am in image upload route !!");
        // Upload an image
        const uniqueId = uuidv4(); 
        const folderName = `TechTribe_User_Profile_Avatar/User_Images/${loggedInUser.firstName}_${loggedInUser._id}`;
        const publicId = isProfile ? `${loggedInUser.firstName}_Profile_Image_${uniqueId}` : `${loggedInUser.firstName}_Image_${uniqueId}`;

        console.log("folderName : " + folderName);
        console.log("publicId : " + publicId);

        const uploadResult = await cloudinary.uploader
        .upload(
            image, {
                // upload_preset: 'TechTribe_unsigned_upload',
                public_id: publicId,
                folder: folderName,
                // folder: 'TechTribe_User_Profile_Avatar/Logos',
                allowed_formats: ['png' , 'jpg' , 'jpeg' , 'svg' , 'ico' , 'jfif' , 'webp' ]
            }
        )
        if (!uploadResult) {
            return res.status(500).send("Failed to upload image to Cloudinary.");
        }
        res.status(200).send(uploadResult);
        
    } catch (error) {
        res.status(401).send(error.message);
    }
});

profileRouter.get("/profile/view" , userAuth , async (req,res) => {
    try{
        const user = req.user;

        // 🔁 Check if premium membership has expired
        const now = new Date();
        if (
            user.membershipType !== "Free" &&
            user.membershipExpiresAt &&
            new Date(user.membershipExpiresAt) < now
        )
        {
            user.membershipType = "Free";
            user.membershipExpiresAt = undefined;
        }

        const lastSwipe = new Date(user.lastSwipeDate);

        const isNewDay = now.toDateString() !== lastSwipe.toDateString();

        if (isNewDay) {
            user.swipes = 0;
            user.lastSwipeDate = now;
            await user.save(); // save only if swipes were reset
        }

        res.send(user);
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

        console.log("i am in the profile edit route !!");
        console.log("REQ body : "+req.body);

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