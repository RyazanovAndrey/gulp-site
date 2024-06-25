const gulp = require('gulp')
const { src, dest, series, parallel, watch } = gulp

const html = require('gulp-file-include')
const sass = require('gulp-sass')(require('sass'))
const sassglob = require('gulp-sass-glob')
const imagemin = require("gulp-imagemin")
const rigger = require('gulp-rigger')
const del = require('del')
const serverLoad = require('gulp-server-livereload')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
const newer = require('gulp-newer')

const errorMessage = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error: <%= error.message %>',
            sound: false,
        })
    }
}

function htmlTask() {
    return src('./src/*.html')
    .pipe(plumber(errorMessage('HTML Error')))
    .pipe(html({
        prefix:'@@',
        basepath: '@file'
    }))
    .pipe(dest('./dist'))
}

function scssTask(){
    return src('./src/scss/*.scss')
    .pipe(newer('./dist/css'))
    .pipe(plumber(errorMessage('SCSS Error')))
    .pipe(sourcemaps.init())
    .pipe(sassglob())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(dest('./dist/css'))
}

function jsTask() {
    return src('./src/js/*.js')
    .pipe(newer('./dist/js'))
    .pipe(plumber(errorMessage('HTML Error')))
    .pipe(rigger())
    .pipe(dest('./dist/js'))
}

function imageTask() {
    return src('./src/img/**/*', {encoding: false})
    .pipe(newer('./dist/img'))
    .pipe(imagemin())
    .pipe(dest('./dist/img'))
}

function fontTask() {
    return src('./src/fonts/**/*')
    .pipe(newer('./dist/fonts'))
    .pipe(dest('./dist/fonts'))
}

function cleanTask() {
    // return del(['./dist/*', '!./dist/img'])
    return del('./dist')
}

function serverTask() {
    return src('./dist')
        .pipe(serverLoad({
            livereload: true,
            open: true
        }))
}

function watchTask() {
    watch('./src/**/*.html', htmlTask)
    watch('./src/scss/**/*.scss', scssTask)
    watch('./src/js/*.js', jsTask)
    watch('./src/img/**/*', imageTask)
    watch('./src/fonts/*', fontTask)
}

exports.default = series(cleanTask, parallel(htmlTask, scssTask, jsTask, imageTask, fontTask), parallel(serverTask, watchTask))

exports.htmlTask = htmlTask
exports.scssTask = scssTask
exports.jsTask = jsTask
exports.imageTask = imageTask
exports.fontTask = fontTask
exports.cleanTask = cleanTask
exports.serverTask = serverTask
exports.watchTask = watchTask
