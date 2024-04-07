const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

const User = require("../models/user.js");


exports.signup = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "signup.html"));
};

exports.login = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "login.html"));
};

function isStringInvalid(string) {
  if (string === undefined || string.length === 0) {
    return true
  }
  else {
    return false
  }
}

function generateAccessToken(id, name, premium) {
  return jwt.sign({ userId: id, name: name, premium: premium }, process.env.TOKEN_SECRET);
}

exports.addUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const name = req.body.Name;
    const email = req.body.Email;
    const password = req.body.Password;

    let userExist = await User.findOne({ email })

    if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ status: false, message: 'Bad Parameter. Something is Misssing !' });
    }

    if (!userExist) {
      bcrypt.hash(password, 10, async (err, hash) => {
        console.log(err);

        const user = new User({
          name: name,
          email: email,
          password: hash,
        },);

        await user.save()

        await session.commitTransaction()
        res.status(201).json({ status: true, message: "User Signed Up Successfully" });
      });
    }
    else {
      res.status(409).json({ message: 'Email already exist!' });
    }


  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      Error: err,
    });
  } finally {
    session.endSession
  }
};

exports.loginCheck = async (req, res, next) => {
  try {
    const email = req.body.Email;
    const password = req.body.Password;

    if (isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ status: false, message: 'Bad Parameter. Something is Misssing !' });
    }

    const loginDetail = await User.findOne({ email: email });
    console.log(`****************loginDetails***********${loginDetail}*********************${loginDetail._id}`);
    if (loginDetail) {
      bcrypt.compare(password, loginDetail.password, (err, result) => {
        if (result === true) {
          res.status(200).json({
            success: true,
            message: "User Logged in Successfully !",
            token: generateAccessToken(loginDetail._id, loginDetail.name, loginDetail.premium),
          });
        } else {
          res
            .status(400)
            .json({ success: false, message: "Incorrect Password !" });
        }
      });
    } else {
      res.status(404).json({ success: false, message: "User not Found" });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err,
    });
  }
};

exports.getTotal = async (req, res, next) => {
  const details = await User.findById(req.user._id).select('total -_id');
  console.log(`*****Total****${details}*******`)


  res.status(201).json({ succes: true, total: details.total, });
}
