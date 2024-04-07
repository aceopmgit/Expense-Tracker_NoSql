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

// const Sequelize = require("sequelize");

// const sequelize = require("../util/database");
// const user = sequelize.define("user", {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true,
//   },
//   Name: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   Email: {
//     type: Sequelize.STRING,
//     unique: true,
//     allowNull: false,
//   },
//   Password: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   Premium: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   },
//   Total: {
//     type: Sequelize.INTEGER,
//     defaultValue: 0
//   }
// });

// module.exports = user;
