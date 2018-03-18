var passport = require('passport');
//MODULE: Handles all Passport.js based login integration details

module.exports = function (app) {
	var Course = require('../utils/aws-init.js').course;
	app.get('/',function(req, res){
		Course.scan().loadAll().exec(function (err, acc) {
			if(err){
				console.log(err);
			}else{
				res.render('pages/index',{'courses':acc.Items});
			}
		}) 
	});

	app.get('/login',function(req, res){
		res.render('pages/login');
	});

	// app.post('/login', 
	// 	passport.authenticate('local', { failureRedirect: '/login' }),
	// 	function(req, res) {
	// 		res.redirect('/');
	// 	});

	app.get('/auth/github', passport.authenticate('github'));

	app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
		function(req, res) {
			res.redirect('/');
		}
		);

	app.get('/logout',
		function(req, res){
			req.logout();
			res.redirect('/');
		});

	app.get('/profile',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
			res.render('pages/profile', { user: req.user });
		});


	app.get('/db',function(req,res){
		Account.create({email: 'foo@example.com', name: 'Foo Bar', age: 21}, function (err, acc) {
			res.send('created account in DynamoDB'+ acc.get('email'));
		});
	})

	app.get('/initialize',function(req, res){
		dynamo.createTables({
			'Course': {readCapacity: 1, writeCapacity: 1}
		}, function(err) {
			if (err) {
				res.send('Error creating tables: '+ err);
			} else {
				res.send('Table has been created');
			}
		});
	})

	app.get('/dbupdate',function(req, res){
		Account.update({email: 'foo@example.com', name: 'Bar Tester'}, function (err, acc) {
			res.send('update account'+ acc.get('name'));
		});
	})

	app.get('/dbget',function(req, res){
		Account.get('foo@example.com', {ConsistentRead: true, AttributesToGet : ['name','age']}, function (err, acc) {
			res.send('got account'+ acc.get('email'))
			console.log(acc.get('name'));
			console.log(acc.get('age'));
  console.log(acc.get('email')); // prints null
});
	})

	app.get('/course/:alias',function(req, res){
		Course.get(req.params.alias, function (err, acc) {
			if(err){
				console.log(err);
			}else{
   //console.log(acc.attrs);
   res.render('pages/course', { course: acc.attrs });
}

}); 
	})

	app.get('/admin',function(req, res){
		res.render('pages/admin-home');
	})

	app.get('/admin/courses',function(req, res){
		Course.scan().loadAll().exec(function (err, acc) {
			if(err){
				console.log(err);
			}else{
      //console.log(acc.Items[1].attrs);
      res.render('pages/admin-courses',{'courses':acc.Items});
  }
}) 
	})

	app.get('/admin/courses/add',function(req, res){

		res.render('pages/admin-add-courses',{response:""});
	})

	app.get('/admin/batch/add',function(req, res){

		res.render('pages/admin-add-batch');
	})

	app.post('/admin/courses/add',function(req, res){
		Course.create({
			alias   : req.body.alias,
			name : req.body.name,
			minsessions    : req.body.minsessions,
			maxsessions     : req.body.maxsessions,
			fees     : req.body.fees,
			seats     : req.body.seats,
			description     : req.body.description,
			courseCurriculum    : req.body.courseCurriculum,
			courseScope     : req.body.courseScope,
			courseRegistrationStatus     : req.body.courseRegistrationStatus
		}, function (err, acc) {
			if(err){
				console.log(err);
			}
			res.render('pages/admin-add-courses',{response: "New Course Added"});
		});

	})
}