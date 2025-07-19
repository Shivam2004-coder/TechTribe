
const razorpayInstance = require('../src/utils/razorpay');
const Payment = require('../models/payment');
const membershipLevels = require('../src/utils/constants');
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const User = require('../models/user');

const membershipDurationDays = {
  P1W: 7,
  P2W: 21,
  P1M: 30,
  P2M: 90,
  P3M: 180,
  E1W: 7,
  E2W: 21,
  E1M: 30,
  E2M: 90,
  E3M: 180
};

exports.createYourPayment = async (req, res) => {
    try{
        // console.log("Razorpay Keys:", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);

        const { membershipType , membershipDetail } = req.body;
        const{ firstName, lastName , emailId } = req.user;

        const order = await razorpayInstance.orders.create({
            amount: membershipDetail.amount, // Convert from rupees to paise
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName,
                lastName,
                emailId,
                membershipType: membershipType ,
                membershipPlanIdx: membershipDetail.idx,
                validity: membershipDetail.label
            },
        });

        const payment = new Payment({
            userId: req.user._id,
            paymentId: order.id,
            orderId: order.id,
            amount: order.amount / 100, // Convert from paise to rupees
            currency: order.currency,
            status: order.status,
            receipt: order.receipt,
            notes: {
                firstName: order.notes.firstName,
                lastName: order.notes.lastName,
                emailId: order.notes.emailId,
                membershipType: order.notes.membershipType,
                membershipPlanIdx: order.notes.membershipPlanIdx,
                validity: order.notes.validity
            },
        });

        const savedPayment = await payment.save();

        return res.status(200).json( { ...savedPayment.toJSON() , keyId: process.env.RAZORPAY_KEY_ID } );
    }
    catch (error) {
        console.error("Error creating payment:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

};

exports.yourPaymentWebhook = async (req, res) => {
    try{
        // console.log("Webhook Called !");
        const webhookSignature = req.get('x-razorpay-signature');
        validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature, 
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if (!webhookSignature) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        // update the payment status in DB
        const paymentDetails = req.body.payload.payment.entity;
        const payment = await Payment.findOne({ orderId : paymentDetails.order_id });
        payment.status = paymentDetails.status;
        await payment.save();
        // console.log("Payment saved !!");

        // update the user as premium member
        const user = await User.findById({ _id: payment.userId });
        user.membershipType = payment.notes.membershipType;

        // ✅ Use the hash map for expiry duration
        const planIdx = payment.notes?.membershipPlanIdx; // You need to pass this from frontend
        const durationInDays = membershipDurationDays[planIdx] || 0;
        user.membershipExpiresAt = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000);

        await user.save();
        // console.log("User Saved !!");
        
        if (req.body.event === 'payment.captured') {
            
        }
        
        if (req.body.event === 'payment.failed') {
            // Handle payment failure
            console.error("Payment failed:", req.body);
            return res.status(200).json({ message: "Payment failed" });
        }
        
        // return success response to razorpay
        return res.status(200).json({ message: "Webhook received successfully" });
    }
    catch (error) {
        console.error("Error in webhook:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

};

exports.verifyYourPayment = async (req, res) => {
    const user = req.user.toJSON();
    if (user.membershipType !== "Free") {
        return res.json({ isPremiumMember: true });
    }
    return res.json({ isPremiumMember: false});
};