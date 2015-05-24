module.exports = function ( grunt, options ) {
	var opts = options;
	return {
		dist : {
			options : {
				outputStyle : 'nested'
			},
			files : [ {
				expand : true,
				cwd : opts.devCssDir,
				src : [ '*.scss', '!_*' ],
				dest : opts.buildCssDir,
				rename : function ( dest, src ) {
					return dest + src.replace( 'scss', 'css' );
				}
			} ]
		}
	};
};
