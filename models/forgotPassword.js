const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now // Setting default value to current date/time
    }
})

forgotPasswordSchema.pre('save', function (next) {
    if (!this.createdDate) {
        this.createdDate = new Date()
    }
    next();
})

module.exports = mongoose.model('forgotPassword', forgotPasswordSchema);

// const

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');
// const { v4: uuidv4 } = require('uuid');

// const fPassword = sequelize.define('ForgotPasswordRequests', {
//     id: {
//         type: Sequelize.UUID,
//         allowNull: false,
//         primaryKey: true,
//     },
//     userId: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//     },
//     isActive: Sequelize.BOOLEAN
// })

// module.exports = fPassword;