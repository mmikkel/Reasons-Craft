module.exports = function ( grunt, options ) {
	return {
		dist : {
			files : [ {
				expand : true,
				cwd : options.buildCssDir,
				src : [ '*.css' ],
				dest : options.buildCssDir
			} ]
		}
	};
};
