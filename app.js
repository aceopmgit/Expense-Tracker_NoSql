const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const path = require("path");
const fs = require('fs');
const mongoose = require('mongoose')
// const helmet = require('helmet');
// const morgan = require('morgan');
// const expressWinston = require('express-winston');
// const { transports, format } = require('winston');
require('dotenv').config();


const app = express();

const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");
const purchaseRoutes = require("./routes/purchase")
const indexRoutes = require("./routes/index");
const passwordRoutes = require("./routes/password");
const errorRoutes = require('./routes/error404');

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });

// app.use(expressWinston.logger({
//   //transports are place where we want to save our logs
//   transports: [
//     //new transports.Console(),
//     //400 is warning  & 500 is error
//     new transports.File({
//       level: 'warn',
//       filename: path.join(__dirname, 'logs', 'logWarnings.log')
//     }),
//     new transports.File({
//       level: 'error',
//       filename: path.join(__dirname, 'logs', 'logErrors.log')
//     }),

//   ],
//   //used for deciding the format of logging
//   format: format.combine(
//     format.json(),
//     format.timestamp(),
//     format.prettyPrint()
//   ),
//   statusLevels: true
// }))
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
// app.use(helmet({
//   contentSecurityPolicy: false
// }))
// app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3000;


app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/password", passwordRoutes);
app.use(indexRoutes);
app.use(errorRoutes);


mongoose.connect(process.env.CONNECTION_STRING)
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`*********************Port is running at port ${PORT}****************************`);
    });
  })
  .catch((err) => {
    console.log(err);
  });




