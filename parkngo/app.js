const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const request = require('request');
const bodyParser = require("body-parser");
const session = require('express-session');
const flash = require('express-flash');
const indexRouter = require('./routes/index');

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use(flash());
// make userID available in templates
app.use(function (req, res, next) {
    res.locals.currentUser = req.session.userId; // locals provides a way to add information to the response object
    next();
});

// //PORT - an environment variable that relies on the port assignment in an outside process in the OS
const port = process.env.PORT || 3003; // '||' means otherwise use 3000 
console.log(`Server is listening on port ${port}`);


module.exports = app;