var gulp = require('gulp'),
    elixir  = require('laravel-elixir'),
    gulpIf = require('gulp-if'),
    browserify = require('browserify'),
    uglify  = require('gulp-uglify'),
    rename  = require('gulp-rename'),
    transform = require('vinyl-transform'),
    _  = require('underscore'),
    utilities = require('laravel-elixir/ingredients/helpers/Utilities'),
    notifications = require('laravel-elixir/ingredients/helpers/Notification');

elixir.extend('browserify', function (src, outputDir, options) {

    var config = this,
        defaultOptions = {
            debug:         ! config.production,
            rename:        "bundle.js",
            srcDir:        config.assetsDir + 'js',
            output:        outputDir || config.jsOutput,
            transform:     ['debowerify'],
            insertGlobals: false,
        };

    options = _.extend(defaultOptions, options);
    src = utilities.buildGulpSrc(src, options.srcDir, '**/*.js');

    gulp.task('browserify', function () {

        var onError = function(e) {
            new notifications().error(e, 'Browserify Compilation Failed!');
            this.emit('end');
        };

        var browserified = transform(function(filename) {
            var b = browserify(filename);
            return b.bundle();
        });

        return gulp.src(src)
            .pipe(browserified).on('error', onError)
            .pipe(gulpIf(! options.debug, uglify()))
            .pipe(rename(options.rename))
            .pipe(gulp.dest(options.output))
            .pipe(new notifications().message('Browserified!'));
    });

    this.registerWatcher('browserify', options.srcDir + '/**/*.js');
    return this.queueTask('browserify');
});
