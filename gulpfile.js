const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
// Optimize Images
gulp.task('imageMinCoverImage', () =>
    gulp.src('src/assets/cover-image.jpg')
        .pipe(imagemin())
        .pipe(gulp.dest('static/assets/'))
);

gulp.task('imageMinCompanyImages', () =>
    gulp.src('src/assets/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('static/assets/images/'))
);

gulp.task('imageMinCourseIcon', () =>
    gulp.src('src/assets/images/course-icon/*')
        .pipe(imagemin())
        .pipe(gulp.dest('static/assets/images/course-icon/'))
);

gulp.task('imageMinFeedbacks', () =>
    gulp.src('src/assets/images/feedbacks/*')
        .pipe(imagemin())
        .pipe(gulp.dest('static/assets/images/feedbacks/'))
);

gulp.task('imageMinProjects', () =>
    gulp.src('src/assets/images/projects/*')
        .pipe(imagemin())
        .pipe(gulp.dest('static/assets/images/projects/'))
);

gulp.task('imageMinFavicons', () =>
    gulp.src('src/assets/favicon/*.png')
        .pipe(imagemin())
        .pipe(gulp.dest('static/assets/favicon/'))
);

// Minify JS
gulp.task('minifyJS', function () {
    gulp.src('src/assets/js/*.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('static/assets/js/'));
});

// Gulp task to minify CSS files
gulp.task('cssMin', function () {
    gulp.src('src/assets/css/*.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('static/assets/css/'));
});

gulp.task('default', ['imageMinCoverImage', 'imageMinCompanyImages', 'imageMinCourseIcon', 'imageMinFeedbacks', 'imageMinProjects','imageMinFavicons', 'minifyJS', 'cssMin']);