module.exports = function ( grunt, options ) {
	var opts = options;

	return {
		grunt : {
			files : [
				'Gruntfile.js',
				'./grunt-configs/**/*.js'
			],
			tasks : [
				'build'
			]
		},
		js : {
			files : [
				opts.devJsDir + '**/*.js',
			],
			tasks : [
				'clean:js',
				'compile:js',
				'growl:complete'
			],
			options : {
				spawn : false
			}
		},
		css : {
			files : [
				opts.devCssDir + '**/*.scss'
			],
			tasks : [
				'clean:css',
				'compile:css',
				'growl:complete'
			],
			options : {
				spawn : false
			}
		}
	};
};
