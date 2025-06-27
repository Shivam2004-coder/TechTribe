const express = require('express');
const { userAuth } = require('../middlewares/auth');
const paymentRouter = express.Router();
const { createYourPayment, yourPaymentWebhook, verifyYourPayment } = require('../Controllers/paymentControllers');


paymentRouter.post("/payment/create", userAuth, createYourPayment );

paymentRouter.post("/payment/webhook", yourPaymentWebhook );

paymentRouter.get("/payment/verify", userAuth, verifyYourPayment );

module.exports = paymentRouter;