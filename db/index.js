const mongoose = require('mongoose');
const webpush = require('web-push');


//DB Connection Setup
mongoose.connect(process.env.MLAB_DB_URI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected To MLab Cloud Database :p");
});

//DB Schema Setup
var CourseSchema = mongoose.Schema({
    alias: String,
    name: String,
    courseCurriculum: String,
    courseRegistrationStatus: String,
    courseScope: String,
    createdAt: String,
    description: String,
    fees: Number,
    maxsessions: Number,
    minsessions: Number,
    seats: Number,
    courseProjects: String,
    viewIndex: Number,
    courseThumbnail: String
});

var venueSchema = mongoose.Schema({
    name: String,
    latitude: String,
    longitude: String,
    phoneno: String,
    address: String
});

var batchSchema = mongoose.Schema({
    course_alias: String,
    start_date: String,
    end_date: String,
    venue: String,
    intake: String,
    visibility: String
});

var courseRegistrationSchema = mongoose.Schema({
    phoneno: String,
    batch: String,
    payment_status: String,
    referer: String
});

var studentSchema = mongoose.Schema({
    phoneno: String,
    email: String,
    first_name: String,
    last_name: String,
    dob: String,
    college: String,
    branch: String,
    year_passing: String,
    github: String
});

var feedbackSchema = mongoose.Schema({
    feedback: String,
    first_name: String,
    last_name: String,
    placed_at: String,
    intern_at: String,
    visibilityHome: String,
    visibilityCourse: String
});

var pushNotificationsRegistrationSchema = mongoose.Schema({
    endpoint: String,
    phoneno: String
});

//Model Setup
var Course = mongoose.model('Course', CourseSchema);
var Venue = mongoose.model('Venue', venueSchema);
var Batch = mongoose.model('Batch', batchSchema);
var Registration = mongoose.model('Registration', courseRegistrationSchema);
var Student = mongoose.model('Student', studentSchema);
var Feedback = mongoose.model('feedback', feedbackSchema);
var PushNotificationsRegistration = mongoose.model('PushNotificationsRegistration', pushNotificationsRegistrationSchema);

module.exports = function (app) {

    app.get('/', function (req, res) {

        Course.find({}, null, {sort: {viewIndex: 1}}, function (err, c_data) {
            if (err) console.error(err);
            else {
                Batch.find({visibility: 'public'}, function (err, b_data) {
                    if (err) console.error(err);
                    else {
                        Feedback.find({}, function (err, f_data) {
                            if (err) console.error(err);
                            res.render('pages/index', {'courses': c_data, 'batch': b_data, 'feedbacks': f_data});
                        })
                    }
                })
            }
        });
    });

    app.get('/course/:alias', function (req, res) {
        Course.findOne({'alias': req.params.alias}, function (err, c_data) {
            if (err)
                console.error(err);
            else {
                Batch.find({course_alias: req.params.alias, visibility: 'public'}, function (err, b_data) {
                    if (err) console.error(err);
                    else {
                        console.log(b_data);
                        Feedback.find({}, function (err, f_data) {
                            if (err) console.error(err);
                            res.render('pages/course', {course: c_data, batch: b_data, feedbacks: f_data});
                        })
                    }
                })
            }
        });
    });

    //5ad793af9ebea21848a9a0d5
    app.get('/invite/course/:alias/:batch', function (req, res) {
        Course.findOne({'alias': req.params.alias}, function (err, c_data) {
            if (err)
                console.error(err);
            else {
                Batch.find({_id:req.params.batch}, function (err, b_data) {
                    if (err) console.error(err);
                    else {
                        console.log(b_data);
                        Feedback.find({}, function (err, f_data) {
                            if (err) console.error(err);
                            res.render('pages/course', {course: c_data, batch: b_data, feedbacks: f_data});
                        })
                    }
                })
            }
        });
    });

    app.post('/course/register', function (req, res) {
        var newRegistration = new Registration({
            phoneno: req.body.phoneno,
            batch: req.body.batch,
            payment_status: 'CASH',
            referer: req.body.referer
        });
        newRegistration.save(function (err, data) {
            if (err) console.error(err);
            else {
                console.log(data);
                var newStudent = new Student({
                    phoneno: req.body.phoneno,
                    email: req.body.email,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    dob: req.body.dob,
                    college: req.body.college,
                    branch: req.body.branch,
                    year_passing: req.body.year_passing,
                    github: "NA"
                });
                newStudent.save(function (err, data) {
                    if (err) console.error(err);
                    console.log(data);
                    res.render('pages/registration-successful');
                })
            }
        })
    });

    app.get('/student/:phoneno', function (req, res) {
        Student.findOne({phoneno: req.params.phoneno}, {_id: 0, first_name: 1, last_name: 1}, function (err, data) {
            if (err) console.error(err);
            if (data)
                res.send(data);
            else
                res.send('No Student Found');
        });
    });

    app.get('/admin/courses', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        Course.find({}, null, {sort: {viewIndex: 1}}, function (err, data) {
            if (err) console.error(err);
            else {
                Batch.find({}, function (err, b_data) {
                    if (err) console.error(err);
                    res.render('pages/admin-courses', {'courses': data, 'batches': b_data});
                })
            }
        })
    });

    app.get('/admin/batch/registrations/:batchId/:courseName', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        batchId = req.params.batchId;
        console.log("fetchRegistrationsForBatch");
        Registration.find({batch: batchId}).lean()
            .then(function (r_data) {
                if (r_data.length) {
                    studentsRegistered = [];
                    registrationsData = r_data;
                    for (index in registrationsData) {
                        console.log("Searching for index: " + index);
                        Student.findOne({phoneno: registrationsData[index].phoneno}).lean().then(function (s_data) {
                            console.log(s_data);
                            studentsRegistered.push(s_data);
                            if (studentsRegistered.length === registrationsData.length) {
                                //res.send(studentsRegistered);
                                res.render('pages/admin-batch-registrations', {
                                    students: studentsRegistered,
                                    courseName: req.params.courseName
                                });
                            }

                        });
                    }
                } else {
                    res.render('pages/admin-batch-registrations', {
                        students: '',
                        courseName: req.params.courseName
                    });

                }


            })

    });

    app.get('/admin/batch/update/:batchId', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        Batch.findOne({_id: req.params.batchId}, function (err, b_data) {
            if (err) console.error(err);
            else {
                Venue.find({}, function (err, v_data) {
                    if (!err)
                        res.render('pages/admin-add-batch', {
                            'batch': b_data,
                            'response': '',
                            'venue': v_data,
                            'course': ''
                        });
                })
            }
        })
    });

    app.post('/admin/batch/update/:batchId', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        console.log(req.body);
        Batch.findOneAndUpdate({_id: req.params.batchId}, {
            start_date: req.body.start_date,
            end_date: req.body.end_date, venue: req.body.venue, intake: req.body.intake, visibility: req.body.visibility
        }, function (err, data) {
            if (err) console.error(err);
            console.log(data);
            res.redirect('/admin/courses');
        })
    });

    app.get('/admin/batch/hide/:batchId', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        console.log(req.body);
        Batch.findOneAndUpdate({_id: req.params.batchId}, {visibility: 'hidden'}, function (err, data) {
            if (err) console.error(err);
            console.log(data);
            res.redirect('/admin/batch');
        })
    });

    app.get('/admin/batch/show/:batchId', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        console.log(req.body);
        Batch.findOneAndUpdate({_id: req.params.batchId}, {visibility: 'public'}, function (err, data) {
            if (err) console.error(err);
            console.log(data);
            res.redirect('/admin/batch');
        })
    });

    app.get('/admin/batch/add/:courseAlias', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        Venue.find({}, function (err, v_data) {
            if (err) console.error(err);
            res.render('pages/admin-add-batch', {
                'batch': '',
                'response': '',
                'venue': v_data,
                'course': [{alias: req.params.courseAlias, name: req.params.courseAlias}],
                response: ""
            });
        })
    });

    app.post('/admin/batch/add', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        var newBatch = new Batch({
            course_alias: req.body.course_alias,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            venue: req.body.venue,
            intake: req.body.intake,
            visibility: req.body.visibility
        });
        newBatch.save(function (err, data) {
            if (err) return console.error(err);
            Venue.find({}, function (err, v_data) {
                if (err) console.error(err);
                Course.find({}, function (err, c_data) {
                    if (err) console.error(err);
                    res.render('pages/admin-add-batch', {
                        'batch': '',
                        'venue': v_data,
                        'course': c_data,
                        response: "New batch added",
                        'course': ''
                    });
                })
            })
        });

    });

    app.post('/admin/courses/add', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        var newCourse = new Course({
            alias: req.body.alias,
            name: req.body.name,
            courseCurriculum: req.body.courseCurriculum,
            courseRegistrationStatus: req.body.courseRegistrationStatus,
            courseScope: req.body.courseScope,
            createdAt: new Date(),
            description: req.body.description,
            fees: req.body.fees,
            maxsessions: req.body.maxsessions,
            minsessions: req.body.minsessions,
            seats: req.body.seats,
            courseProjects: req.body.courseProjects,
            courseThumbnail: req.body.courseThumbnail
        })
        newCourse.save(function (err, data) {
            if (err) return console.error(err);
            res.render('pages/admin-add-courses', {response: "New Course Added"});
        })
    });

    app.get('/admin/feedbacks', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        Feedback.find({}, function (err, f_data) {
            if (err) console.error(err);
            else {
                res.render('pages/admin-feedbacks', {feedbacks: f_data});
            }
        })

    });

    app.post('/admin/feedbacks/new', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        var newFeedback = new Feedback({
            feedback: req.body.feedback,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            placed_at: req.body.placed_at,
            intern_at: req.body.intern_at
        });
        newFeedback.save(function (err, data) {
            if (err) console.error(err);
            res.redirect('/admin/feedbacks');
        })
    });

    app.post('/pushNotificationsRegistration', function (req, res) {
        var newPushRegistration = new PushNotificationsRegistration({
            endpoint: JSON.stringify(req.body.endpoint)
        });
        PushNotificationsRegistration.findOne({endpoint: JSON.stringify(req.body.endpoint)}, function (err, data) {
            if (err) console.error(err);
            if (!data) {
                //console.log("--> "+data);
                newPushRegistration.save(function (err, data) {
                    if (err) console.error(err);
                    res.send('Push Registered');
                });
            }
        });

    });

    app.get('/admin/push', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        res.render('pages/admin-pushnotifications', {response: ''});
    });

    app.post('/admin/push', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {

        //  const vapidKeys = webpush.generateVAPIDKeys();
        //  console.log(vapidKeys.publicKey);
        //  console.log(vapidKeys.privateKey);
        //  process.exit();

        webpush.setVapidDetails(
            'mailto:vipin@codeshala.org',
            'BE9vrCIh3D4eykUOA5t9jOWGZX4lOqhMWTmQdxcTHWwvXlWn-c7DKZRgRSG_XZXylg1ov5RrtKYLM22YaAAouVY',
            'bN8RKqLGkGaHqQUqeUwHReKGoER8BQHtIs-sHiUYQyk'
        );

        const notification = JSON.stringify({
            title: req.body.title,
            body: req.body.body,
            url: req.body.url
        });

        PushNotificationsRegistration.find({}, function (err, data) {
            if (err) console.error(err);
            if (data) {
                for (index in data) {
                    var endpoint = JSON.parse(data[index].endpoint);
                    webpush.sendNotification(endpoint, notification)
                        .then(success => console.log(success))
                        .catch(error => console.log(error));
                }
                res.render('pages/admin-pushnotifications', {response: 'Push notifications are being delivered!!'});
            }
        });

    });

    app.get('/venueRegistration', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        console.log(req.body);
        var newVenue = new Venue({
            name: "Manav Rachna University",
            latitude: "28.4503796",
            longitude: "77.2157909",
            phoneno: "9643763712",
            address: "Aravalli Campus, Delhi -Surajkund Road, Sector 43, Gadakhor Basti Village, Rocky Area, Faridabad, Haryana 121004"
        })
        newVenue.save(function (err, data) {
            if (err) return console.error(err);
            res.send(data);
        })
    });

    app.post('/studentRegistration', function (req, res) {


        var newRegistration = new Registration({
            phoneno: req.body.phoneno,
            batch: req.body.batch,
            payment_status: req.body.payment_status
        });
        newRegistration.save(function (err, data) {
            if (err) return console.error(err);
            res.send(data);
        });

    });

    app.get('/studentlogin', function(req, res) {

        res.render('pages/student-login');
    });

    app.post('/studentlogin', function(req, res) {

        var email = req.body.email;
        var password = req.body.password;
        res.redirect('/');
    });


}