module.exports = {
  root: {
    src: './source',
    dest: './reasons/resources',
    del : {
        force : false,
    }
  },

  tasks: {
    js: {
      src: 'javascripts',
      dest: 'javascripts',
      extractSharedJs: false,
      entries: {
        // FLD : ['./fld.js'],
        // EditForm : ['./edit.js'],
        reasons: ['./reasons.js']
      },
      extensions: ['js']
    },

    css: {
      src: 'stylesheets',
      dest: 'stylesheets',
      autoprefixer: {
        browsers: ['last 3 version']
      },
      sass: {
        //indentedSyntax: true // Enable .sass syntax (.scss still works too)
        includePaths : [
            //'node_modules/susy/sass/',
            //'node_modules/breakpoint-sass/stylesheets/',
            //'node_modules/bourbon/app/assets/stylesheets/',
        ],
      },
      extensions: ['sass', 'scss', 'css']
    },

    vendor: {
      src: [
          //'bower_components/jquery/dist/jquery.js',
          //'bower_components/modernizr/modernizr.js',
          //'bower_components/history.js/scripts/bundled/html5/jquery.history.js'
      ],
      dest: 'vendor',
      extensions: ['*']
    },

    html: {
      src: 'html',
      dest: './',
      htmlmin: {
        collapseWhitespace: true
      },
      extensions: ['html'],
      excludeFolders: ['layouts', 'shared', 'macros']
      // watchOther: './app/views/*/**.html'
    },

    images: {
      src: 'images',
      dest: 'images',
      extensions: ['jpg', 'png', 'svg', 'gif']
    },

    fonts: {
      src: 'fonts',
      dest: 'fonts',
      extensions: ['woff2', 'woff', 'eot', 'ttf', 'svg']
    },

    iconFont: {
      src: 'icons',
      dest: 'fonts',
      sassDest: 'generated',
      extensions: ['woff2', 'woff', 'eot', 'ttf', 'svg']
    },

    svgSprite: {
        src: 'sprites/svg',
        dest: 'images/spritesheets',
        extensions: ['svg']
    },

    pngSprite: {
        src: 'sprites/png',
        dest: 'images/spritesheets',
        styles: 'stylesheets/generated',
        extensions: ['png']
    }

  }
}
