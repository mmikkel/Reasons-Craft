var config      = require('../config')
if(!config.tasks.svgSprite) return

var browserSync = require('browser-sync')
var gulp        = require('gulp')
var svgmin    = require('gulp-svgmin')
var svgstore    = require('gulp-svgstore')
var path        = require('path')

gulp.task('svgSprite', function() {

  var settings = {
    src: path.join(config.root.src, config.tasks.svgSprite.src, '/**/*.svg'),
    dest: path.join(config.root.dest, config.tasks.svgSprite.dest)
  }

  return gulp.src(settings.src)
    .pipe(svgmin(function (file) {
      var prefix = path.basename(file.relative, path.extname(file.relative));
      return {
          plugins: [{
              cleanupIDs: {
                  prefix: prefix + '-',
                  minify: true
              }
          }]
      }
    }))
    .pipe(svgstore())
    .pipe(gulp.dest(settings.dest))
    .pipe(browserSync.reload({stream: true}))
})
