module.exports = function ( grunt, options ) {
	return {
		js : {
			expand : true,
			cwd : options.buildJsDir,
			src : '**/*',
			dest : options.distJsDir
		},
		vendor : {
			expand : true,
			cwd : options.buildVendorDir,
			src : '**/*',
			dest : options.distVendorDir
		},
		css : {
			expand : true,
			cwd : options.buildCssDir,
			src : '**/*',
			dest : options.distCssDir	
		}
	};
};
