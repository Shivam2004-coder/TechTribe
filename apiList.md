# TechTribe API's

# authRouter
- POST /signup
- POST /login
- POST /logout

# profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

# connectionRequestRouter
- POST /request/send/:status/:toUserId
- POST /request/review/:status/:toUserId

# userRouter
- GET /user/connections
- GET /user/requests
- GET /user/feed   -----> Gets you the profiles of other users on platform 


# Pagination
    - /feed?page=1&limit=10 => 1-10 => .skip(0) & .limit(10)
    - /feed?page=2&limit=10 => 11-20 => .skip(10) & .limit(10)
    - /feed?page=3&limit=10 => 21-30 => .skip(20) & .limit(10)
    - and so on .....

    --- Skip => (page - 1) * limit;



Status : ignore , interested , accepted , rejected





import { v2 as cloudinary } from 'cloudinary';

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: 'dilpkrfrb', 
        api_key: '727939899311466', 
        api_secret: '<your_api_secret>' // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();