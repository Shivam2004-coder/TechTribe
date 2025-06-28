const mongoose = require('mongoose');

const deletedUserFeedbackSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    membershipType: {
      type: String,
      default: 'Free',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    swipesCount: {
      type: Number,
      default: 0,
    },
    age: {
      type: Number,
    },
  },
});

module.exports = mongoose.model('DeletedUserFeedback', deletedUserFeedbackSchema);
