const path = require("path");
const AWS = require('aws-sdk');
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const mongoose = require('mongoose');

const Expense = require("../models/expense.js");
const User = require('../models/user.js')
const Downloads = require("../models/downloads.js");

exports.expense = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "expense.html"));

};

function isStringInvalid(string) {
  if (string === undefined || string.length === 0) {
    return true
  }
  else {
    return false
  }
}

exports.addExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, description, category } = req.body;

    if (isStringInvalid(amount) || isStringInvalid(description) || isStringInvalid(category)) {
      return res.status(400).json({ status: false, message: 'Bad Parameter. Something is Misssing !' });
    }

    console.log(`********user ${req.user}************`)

    const expense = new Expense({
      amount: amount,
      description: description,
      category: category,
      userId: req.user._id
    });

    await expense.save()

    const total = Number(req.user.total) + Number(amount);
    await User.findOneAndUpdate(req.user._id, { total: total });

    await session.commitTransaction();
    res.status(201).json({ expenseDetails: expense });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      Error: err,
    });
  } finally {
    session.endSession();

  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;

    const total = await Expense.find();
    const limit = Number(req.query.limit) || total.length;
    //console.log('******************************', page)
    const details = await Expense.find({ userId: req.user._id }).skip((page - 1) * limit).limit(limit).sort({ createdDate: -1 });
    console.log('******getExpense***************************', details)
    console.log('******************nextPage************', limit * page, total)
    res.status(201).json({
      expenses: details,
      currentPage: page,
      hasNextPage: limit * page < total.length,
      nextPage: page + 1,
      hasPreviousPage: page > 1,
      previousPage: page - 1
    });
  } catch (err) {
    res.status(500).json({
      Error: err,
    });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    const d = await Expense.findOne({ _id: id }).select('amount');

    console.log(`*******delete*****${d}`)

    const total = Number(req.user.total) - Number(d.amount);
    await User.updateOne({ _id: req.user._id }, { $set: { total: total } });

    await Expense.deleteOne({ _id: id });

    await session.commitTransaction()
    res.status(201).json({ status: true })

    // res.sendStatus(200);
  } catch (err) {
    await session.abortTransaction()
    console.log(err)
    res.status(500).json({
      Error: err,
    });
  }
  finally {
    session.endSession()
  }
};

function uploadToS3(data, fileName) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  })


  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: 'public-read'
  }

  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3Response) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      else {
        //console.log('success', s3Response);
        resolve(s3Response.Location);
      }
    })
  })
}


exports.downloadExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction()
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    // const expenses = await req.user.getExpenses();
    //console.log(expenses)
    const stringExpenses = JSON.stringify(expenses)

    //file name should depend on userId and date of download
    const userId = req.user._id;

    const fileName = `Expense_${userId}_${new Date()}.Txt`;
    const fileUrl = await uploadToS3(stringExpenses, fileName);

    const data = new Downloads({
      name: fileName,
      url: fileUrl,
      userId: req.user._id
    })

    await data.save();

    await session.commitTransaction()

    console.log(data);
    res.status(200).json({ fileUrl, success: true })
  } catch (err) {
    await session.abortTransaction()
    res.status(500).json({ fileUrl: '', success: false, Error: err });
  }
  finally {
    session.endSession();
  }
}

exports.downloadHistory = async (req, res, next) => {
  try {
    const downloads = await Downloads.find({ userId: req.user._id }).select('name url createdDate').sort({ createdDate: -1 })
    // const downloads = await req.user.getDownloads({
    //   attributes: ['Name', 'Url', 'createdAt'],
    //   order: [
    //     ['createdAt', 'DESC']
    //   ],
    // })
    res.status(201).json({ downloadList: downloads });
  } catch (err) {
    res.status(500).json({
      Error: err,
    });
  }
}
