const mongoose = require('mongoose');

let PostSchema = mongoose.Schema({
    title: String,
    slug: String,
    body: String,
    author: String,
    timestamp: Date,
    views: Number,
    upvotes: Number
});

let Post = mongoose.model('post', PostSchema);

module.exports = function (app) {

    //list all blogs
    app.get('/blog', function (req, res) {
        Post.find({}, function (err, data) {
           res.render('blog/pages/home',{posts:data});
        });
    });

    //Editor page for creating new blog
    app.get('/createNewBlog', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        res.render('blog/pages/new');
    });

    //Add a new blog to database
    //TODO: Check for prexisiting slug
    app.post('/saveNewBlog', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
        let slug = req.body.title.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');

        let newPost = new Post({
            title: req.body.title,
            slug: slug,
            body: req.body.body,
            author: 'Codeshala',
            timestamp: new Date(),
            views: 0,
            upvotes: 0
        });

        newPost.save(function (err, data) {
            if (err) console.error(err);
            else {
                console.log(data);
                res.send(data.slug);
            }
        });
    });

    //Upvote a blog
    app.get('/upvoteBlog/:slug', function (req, res) {
        Post.findOneAndUpdate({slug: req.params.slug}, {$inc: {upvotes: 1}}, {new: true}, function (err, post_data) {
            if (err) console.error(err);
            else if (post_data) {
                res.send(post_data);
            } else {
                res.send('Post does not exist');
            }
        });
    });

    //Show a blog
    app.get('/blog/:slug', function (req, res) {
        Post.findOneAndUpdate({slug: req.params.slug}, {$inc: {views: 1}}, {new: true}, function (err, post_data) {
            if (err) console.error(err);
            else if (post_data) {
                //res.send(post_data);
                function formattedDate(d) {
                    let month = String(d.getMonth() + 1);
                    let day = String(d.getDate());
                    const year = String(d.getFullYear());

                    if (month.length < 2) month = '0' + month;
                    if (day.length < 2) day = '0' + day;

                    return `${day}/${month}/${year}`;
                }

                res.render('blog/pages/blog', {post: post_data, time: formattedDate(post_data.timestamp)});
            } else {
                res.render('pages/404');
            }
        });
    });
};