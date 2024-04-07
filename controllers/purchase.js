const Razorpay = require('razorpay');
const Order = require('../models/orders');
const User = require('../models/user');
const Expense = require('../models/expense');
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
// const e = require('express');
// const sequelize = require('sequelize');
// const s = require('../util/database.js')

function generateAccessToken(id, name, premium) {
    return jwt.sign({ userId: id, name: name, premium: premium }, process.env.TOKEN_SECRET);
}

exports.purchasePremium = (req, res, next) => {
    const rzp = new Razorpay({
        key_id: process.env.RAZOR_KEY_ID,
        key_secret: process.env.RAZOR_KEY_SECRET
    })

    const amount = 5000;
    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
        try {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            const o = new Order({ orderId: order.id, status: 'PENDING', userId: req.user._id });
            await o.save();
            return res.status(201).json({ order, key_id: rzp.key_id });
        } catch (err) {
            console.error(err)
            return res.status(403).json({
                message: 'Something went wrong !',
                Error: err.message
            })
        }

    })


}

exports.updateTransaction = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { order_id, payment_id, status } = req.body
        // console.log(req.body)
        // const order = await Order.findOne({ where: { orderId: order_id } }, { transaction: t })

        if (status === 'SUCCESSFUL') {
            const promise1 = Order.updateOne({ orderId: order_id }, { $set: { paymentId: payment_id, status: status } });
            const promise2 = User.updateOne({ _id: req.user._id }, { $set: { premium: true } });
            Promise.all([promise1, promise2]).then(async () => {
                await session.commitTransaction();
                res.status(201).json({ success: true, message: 'Transaction Successfull', token: generateAccessToken(req.user._id, undefined, true) });
            }).catch((err) => {
                throw new Error(err);
            })
        }
        else {
            const promise1 = Order.updateOne({ orderId: order_id }, { $set: { paymentId: payment_id, status: status } });
            const promise2 = User.updateOne({ _id: req.user._id }, { $set: { premium: false } });
            Promise.all([promise1, promise2]).then(async () => {
                await session.commitTransaction();
                res.status(201).json({ success: false, message: 'Transaction Failed' });
            }).catch((err) => {
                throw new Error(err);
            })
        }
    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        res.status(403).json({
            message: 'Something went wrong !',
            Error: err
        })

    } finally {
        session.endSession();
    }



}

//  exports.premiumCheck = async (req, res, next) => {
//  const details = await User.findOne({ where: { id: req.user.id } });
//   console.log(details.Premium)
//     res.status(201).json({ Premium: details.Premium });
// }


exports.showLeaderBoard = async (req, res, next) => {
    const details = await User.find().select('name total').sort({ total: -1 })

    res.status(201).json({ details: details });


}



