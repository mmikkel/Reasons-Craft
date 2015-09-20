var config      = require('../config')
if(!config.tasks.pngSprite) return

var browserSync = require('browser-sync')
var gulp        = require('gulp')
var spritesmith = require('gulp.spritesmith');
var imagemin    = require('gulp-imagemin');
var merge = require('merge-stream');
var csso = require('gulp-csso');
var path        = require('path')

gulp.task('pngSprite', function() {

    var settings = {
        src: path.join(config.root.src, config.tasks.pngSprite.src, '/**/*.png'),
        retinaSrc : path.join(config.root.src, config.tasks.pngSprite.src, '/**/*@2x.png'),
        dest: path.join(config.root.dest, config.tasks.pngSprite.dest),
        imgPath : '../images',
        stylesDest: path.join(config.root.src, config.tasks.pngSprite.styles),
    }

    // Generate our spritesheet
    var spriteData = gulp.src(settings.src).pipe(spritesmith({
        imgName: 'pngSprites.png',
        cssName: '_pngSprites.scss',
        retinaSrcFilter : settings.retinaSrc,
        retinaImgName : 'pngSprites@2x.png',
        cssVarMap : function (sprite)
        {
            sprite.name = 'pngsprite-' + sprite.name;
        }
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
        .pipe(imagemin())
        .pipe(gulp.dest(settings.dest));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        //.pipe(csso())
        .pipe(gulp.dest(settings.stylesDest))
        .pipe(browserSync.reload({stream: true}));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream)

})
