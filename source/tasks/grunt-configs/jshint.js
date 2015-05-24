module.exports = function ( grunt, options ) {
	return {
		options : {
			jshintrc : './resources/jshint_conf.json'
		},
		self : {
			files : [ {
				expand : true,
				cwd : './',
				src : [
					'Gruntfile.js',
					'grunt-configs/**/*.js'
				],
				dest : './'
			} ]
		},
		common : {
			files : [ {
				expand : true,
				cwd : options.devJsDir,
				src : [
					'main.js',
					'app/**/*.js'
				],
				dest : options.devJsDir
			} ]
		}
	};
};
