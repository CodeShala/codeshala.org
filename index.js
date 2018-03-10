/********************
 ****Importing Required Modules
 ********************
**/
var express = require('express');
var app = express();

/****************************************
 ****Configuring Folder for Static Assets   
 ****************************************
**/
app.use(express.static('static'));

/******************************************************
 ****Configuring rendering engine for webpage rendering   
 ******************************************************
**/
app.set('view engine', 'ejs');


app.get('/',function(req, res){
	res.render('index');
})


/******************************************************
 ****Spinning up the server on a port   
 ******************************************************
**/
app.listen(process.env.PORT||3000,function(){
	console.log('SERVER LISTENING');
})