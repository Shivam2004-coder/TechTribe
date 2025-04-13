const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({ 
    cloud_name: 'dilpkrfrb', 
    api_key: '727939899311466', 
    api_secret: 'v5d73HP_t4L4pVSYfnZl2bk-oDY' // Click 'View API Keys' above to copy your API secret
});

module.exports = cloudinary;