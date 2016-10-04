var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    inject = require('gulp-inject')

var jsSources = ['app/features/**/*.js'],
    cssSources = ['app/css/**/*.css'],
    htmlSources = ['./**/*.html'];

var paths = ['./app/css/**/*.css', './app/features/app.module.js', './app/features/**/*.js'];

gulp.task('inject', function() {
    var sources = gulp.src(paths, { read: false });
    return gulp.src('./app/*.html')
        .pipe(wiredep())
        .pipe(inject(sources, { relative: true }))
        .pipe(gulp.dest('./app'));
});