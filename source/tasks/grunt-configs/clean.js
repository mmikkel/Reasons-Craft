module.exports = function ( grunt, options ) {
	return {
		options : {
			force : true
		},
		fonts : [options.buildFontsDir,options.distFontsDir],
        images : [options.buildImgDir,options.distImgDir],
        js : [options.buildJsDir,options.distJsDir],
        css : [options.buildCssDir,options.distCssDir],
        build : options.buildDir
	};
};
