require('dotenv').config(); // Must be here if this is the entry
const {validateEditProfileData} = require("../src/utils/validation");
const cloudinary = require("../src/utils/cloudinary");
const { v4: uuidv4 } = require('uuid'); // At the top
const avatars = process.env.AVATAR_LINKS.split(",");
// const vision = require('@google-cloud/vision');
// const client = new vision.ImageAnnotatorClient();
const vision = require('@google-cloud/vision');

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8')
);

const client = new vision.ImageAnnotatorClient({
  credentials,
});



exports.deleteSavedImages = async (req, res) => {
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

        res.status(200).json({ 
            message: "Deleted unused images successfully." 
        });
    } catch (error) {
        console.error("Error deleting images:", error);
        res.status(500).json({ 
            message: "Error in saving your images." 
        });
    }
};

exports.deleteSingleImage = async (req, res) => {
    try {
        const { publicId , isProfile } = req.body;

        if (!publicId) {
            return res.status(400).json({ 
                message: "publicId is required to delete the image." 
            });
        }
        
        const loggedInUser = req.user;
        const currentUploadedImages = loggedInUser.uploadedImages;
        const profileImage = loggedInUser.profileImage;

        const isAvatar = (publicId) => {
            if (isProfile) {
                return avatars.includes(publicId) || publicId === process.env.DEFAULT_PROFILE_IMAGE;   
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
        res.status(500).json({ 
            message: "Error occurred while deleting image." 
        });
    }
};

exports.uploadAnImage = async (req , res) => {
    try {
        const {image , isProfile} = req.body;
        
        console.log("Before result :");

        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');

        // Step 1: Moderate Image
        const [result] = await client.safeSearchDetection({ image: { content: imgBuffer } });
        
        console.log("After result :");
        const detections = result.safeSearchAnnotation;

        const { adult, violence, racy, medical, spoof } = detections;

        console.log("I am in image upload route !!");
        // console.log(result);

        // console.log(adult);
        // console.log(violence);
        // console.log(racy);
        // console.log(medical);
        // console.log(spoof);

        const unsafeLabels = ['LIKELY', 'VERY_LIKELY'];
        if (
            unsafeLabels.includes(adult) ||
            unsafeLabels.includes(racy)
        )
        {
            return res.status(400).json({
                message: 'Inappropriate image detected. Please upload a safe image.',
                details: detections
            });
        }



        const loggedInUser = req.user;
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
            return res.status(500).json({
                message: "Failed to upload your image."
            });
        }
        res.status(200).json({
            uploadResult,
            message: "Image uploaded Successfully"
        });
        
    } catch (error) {
        console.error("Image Upload error:", error);
        res.status(500).json({ 
            message: "Unable to upload your image." 
        });
    }
};

exports.profileView = async (req,res) => {
    try{
        const user = req.user;
        console.log("I am in the profile View!!");
        console.log(user);

        let isUpdated = false;

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
            isUpdated = true;
        }

        const lastSwipe = new Date(user.lastSwipeDate);

        const isNewDay = now.toDateString() !== lastSwipe.toDateString();

        if (isNewDay) {
            user.swipes = 0;
            user.lastSwipeDate = now;
            isUpdated = true;
        }
        
        if (isUpdated) {
            await user.save(); // ✅ Save only if necessary
        }

        res.status(200).json({
            user,
            message: "Profile Fetched Successfully"
        });
    }
    catch(err){
        res.status(400).json({
            message: err.message
        });
    }
};

exports.profileEdit = async (req,res) => {
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
        res.status(400).json({
            message: err.message
        });
    }
};

exports.checkImageSafety = async ( req , res ) => {
    try{

        const {image } = req.body;
        
        console.log("Before result :");

        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');

        // Step 1: Moderate Image
        const [result] = await client.safeSearchDetection({ image: { content: imgBuffer } });
        
        console.log("After result :");
        const detections = result.safeSearchAnnotation;

        const { adult, violence, racy, medical, spoof } = detections;

        console.log("I am in Check Safety Image upload route !!");
        console.log(result);

        console.log(adult);
        console.log(violence);
        console.log(racy);
        console.log(medical);
        console.log(spoof);

        const unsafeLabels = ['LIKELY', 'VERY_LIKELY'];
        if (
            unsafeLabels.includes(adult) ||
            unsafeLabels.includes(racy)
        )
        {
            return res.status(400).json({
                message: 'Inappropriate image detected. Please upload a safe image.',
                details: detections
            });
        }

        res.status(200).json({
            message: "ok"
        });
    }
    catch( err ){
        console.error("Image Upload error:", err);
        res.status(500).json({ 
            message: "API is not accepting the request !!", 
        });
    }
}