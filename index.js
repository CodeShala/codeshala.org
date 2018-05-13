var express = require('express');
var dotenv = require('dotenv').config();
var bodyParser = require('body-parser');

var app = express();

//MODULE: Handles all express bases routes
var routes = require('./routes')(app);
//MODULE: Handles all mongoDB Requests
var db = require('./db')(app);

//Process application/x-www-form-urlencoded & application/json
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//Setting 'static' folder to handle all static files like css,js,jpg,png. All static data will be fetched from this folder
app.use(express.static('static'));
//Setting ejs as view engine to render dynamic data into html
app.set('view engine', 'ejs');

//Route to handle 404 
app.get('/*', function (req, res) {
    res.render('pages/404');
});

//Spinning our server up
app.listen(process.env.PORT, function () {
    console.log('SERVER LISTENING AT PORT ' + process.env.PORT);
});