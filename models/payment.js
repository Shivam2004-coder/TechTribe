const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentId: {
        type: String,
    },
    orderId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR',
        required: true
    },
    status: {
        type: String,
        required: true
    },
    receipt: {
        type: String,
        default: ''
    },
    notes: {
        firstName: {
            type: String,
            default: '' 
        },
        lastName: {
            type: String,
            default: ''
        },
        emailId: {
            type: String,
            default: ''
        },
        membershipType: {
            type: String,
            default: ''
        },
        membershipPlanIdx: {
            type: String,
            default: ''
        },
        validity: {
            type: String,
            default: ''
        }
    }
},{timestamp: true});  

module.exports = mongoose.model('Payment', paymentSchema);
