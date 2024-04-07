const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now // Setting default value to current date/time
  }
})

// Defining pre-save middleware to set createdDate
expenseSchema.pre('save', function (next) {
  // Set createdDate to current date/time if not already set
  if (!this.createdDate) {
    this.createdDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);

// const Sequelize = require("sequelize");

// const sequelize = require("../util/database");
// const expense = sequelize.define("expense", {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true,
//   },
//   Amount: {
//     type: Sequelize.INTEGER,
//     allowNull: false,
//   },
//   Description: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   Category: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
// });

// module.exports = expense;
