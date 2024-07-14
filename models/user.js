const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  premium: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0,
  },
  createdDate: {
    type: Date,
    default: Date.now // Setting default value to current date/time
  }

})

// Defining pre-save middleware to set createdDate
userSchema.pre('save', function (next) {
  // Set createdDate to current date/time if not already set
  if (!this.createdDate) {
    this.createdDate = new Date();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

