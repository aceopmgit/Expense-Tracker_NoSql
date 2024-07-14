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

