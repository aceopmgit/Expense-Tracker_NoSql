const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const downloadSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
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

downloadSchema.pre('save', function (next) {
    if (!this.createdDate) {
        this.createdDate = new Date();
    }
    next();
})

module.exports = mongoose.model('Download', downloadSchema);

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const download = sequelize.define('download', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//     },
//     Name: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     Url: {
//         type: Sequelize.STRING,
//         allowNull: false
//     }
// })

// module.exports = download;