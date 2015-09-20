var config       = require('../config')
var gulp         = require('gulp')
var sourcemaps   = require('gulp-sourcemaps')
var browserSync  = require('browser-sync')
var handleErrors = require('../lib/handleErrors')
var path         = require('path')

var paths = {
  src: config.tasks.vendor.src,
  dest: path.join(config.root.dest, config.tasks.vendor.dest)
}

gulp.task('vendor', function () {
return gulp.src(paths.src)
    .pipe(sourcemaps.init())
    .on('error', handleErrors)
    .pipe(gulp.dest(paths.dest))
    .pipe(browserSync.reload({stream:true}))
})
