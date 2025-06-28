const Contact = require('../models/contact'); // Your Mongoose model

exports.saveTheUserMessageInContactCollections = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const userId = req.user._id; // Assuming authentication middleware sets req.user

    const newContact = new Contact({
      userId,
      name,
      email,
      message,
    });

    await newContact.save();

    res.status(201).json({ message: "Message submitted successfully" });
  } catch (err) {
    console.error("Error saving contact message:", err);
    res.status(500).json({ message: "Failed to submit message" });
  }
};