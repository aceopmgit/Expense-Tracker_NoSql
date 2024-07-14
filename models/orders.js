const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    paymentId: {
        type: String
    },
    orderId: {
        type: String
    },
    status: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now // Setting default value to current date/time
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Order', orderSchema);

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//     },
//     paymentId: Sequelize.STRING,
//     orderId: Sequelize.STRING,
//     status: Sequelize.STRING
// })

// module.exports = order;