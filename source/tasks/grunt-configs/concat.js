module.exports = function ( grunt, options ) {
	return {
		app : {
			nonull : true,
			src : [
				options.devJsDir + '**/*.js'
			],
			dest : options.buildJsDir + 'reasons.js',
		},
	};
};
