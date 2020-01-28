let gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    concatCss = require('gulp-concat-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    autoprefixer = require('gulp-autoprefixer'),
    ftp = require('vinyl-ftp'),
    notify = require("gulp-notify");

gulp.task('sass', function () {
    return gulp.src('app/styles/scss/**/*.scss')
        .pipe(sass({
            outputStyle: 'expand'
        }).on("error", notify.onError()))
        .pipe(gulp.dest('app/styles/css'));
});

gulp.task('css', function () {
    return gulp.src([
        'app/styles/css/reset.css',
        'app/styles/css/vi-lazyload.css',
        'app/styles/css/main.css',
        ])
        .pipe(autoprefixer(['last 3 versions']))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(concatCss("style.min.css"))
        .pipe(gulp.dest('app'))
});

gulp.task('js', function () {
    return gulp.src([
        'app/js/vi-lazyload.js',
		'app/js/common.js'
		])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app'))
});

gulp.task('imagemin', function () {
    return gulp.src(['app/img/**/*', '!app/img/**/*.svg'])
        .pipe(cache(imagemin()))
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});

gulp.task('svg', function () {
    return gulp.src('app/img/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('app/img'));
});

gulp.task('clearcache', function () {
    return cache.clearAll();
});

gulp.task('removedist', function (done) {
    done();
    return del.sync('dist');
});

gulp.task('move', function (done) {
    gulp.src([
		'app/*.html',
		]).pipe(gulp.dest('dist'));

    gulp.src([
		'app/style.min.css',
		]).pipe(gulp.dest('dist'));

    gulp.src([
		'app/scripts.min.js',
		]).pipe(gulp.dest('dist'));
    /*
        gulp.src([
    		'app/img/sprite.svg',
    		]).pipe(gulp.dest('dist/img'));
    */
    gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));
    done();
});

gulp.task('deploy', function () {

    let conn = ftp.create({
        host: 'hostname.com',
        user: 'username',
        password: 'userpassword',
        parallel: 10,
        log: gutil.log
    });

    let globs = [
	'dist/**',
	'dist/.htaccess',
	];
    return gulp.src(globs, {
            buffer: false
        })
        .pipe(conn.dest('/path/to/folder/on/server'));
});

gulp.task('watch', function (done) {
    browserSync.init({
        server: "app"
    });
    gulp.watch('app/styles/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('app/styles/css/**/*.css', gulp.series('css'));
    gulp.watch('app/js/**/*.js', gulp.series('js'));
    gulp.watch('app/*.html').on("change", browserSync.reload);
    gulp.watch('app/styles/scss/**/*.scss').on('change', browserSync.reload);
    gulp.watch('app/styles/css/**/*.css').on('change', browserSync.reload);
    gulp.watch('app/js/**/*.js').on('change', browserSync.reload);
    done();
});

gulp.task('build', gulp.series('removedist', 'sass', 'css', 'js', 'imagemin', 'move'));

gulp.task('default', gulp.series('sass', 'css', 'js', 'watch'));
