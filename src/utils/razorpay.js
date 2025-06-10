const Razorpay = require('razorpay');

console.log("Razorpay Keys:", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = instance;