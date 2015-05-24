module.exports = function ( grunt, options ) {
	return {
		js : {
			files : [ {
				expand : true,
				cwd : options.buildJsDir,
				src : [
					'*.js'
				],
				ext : '.js',
				dest : options.buildJsDir + 'compressed/'
			} ]
		}
	};
};
