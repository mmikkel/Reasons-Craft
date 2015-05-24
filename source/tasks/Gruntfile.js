/* global module: false, process: false */

/* =======================================================
	DASHCOLS GRUNTFILE

	@version 1.0.0
* ======================================================= */

module.exports = function ( grunt ) {

	if ( grunt.option( 'time' ) !== undefined && grunt.option( 'time' ) ) {
		require( 'time-grunt' )( grunt );
	}

	var devDir = '../src/',
		buildDir = '../build/',
		distDir = '../../reasons/resources/',
		pkg = grunt.file.readJSON( 'package.json' ),
		banner = '/*! <%= pkg.name %> | @author <%= pkg.author %> | <%= grunt.template.today("dd-mm-yyyy") %> */\n',

		options = {

			banner : banner,
			pkg : pkg,

			isDev : ( grunt.option( 'dev' ) !== undefined ) ? Boolean( grunt.option( 'dev' ) ) : process.env.GRUNT_ISDEV === '1',

			devDir : devDir,
			buildDir : buildDir,

			devJsDir : devDir + 'scripts/',
			devCssDir : devDir + 'styles/',
			devImgDir : devDir + 'images/',
			devFontsDir : devDir + 'webfonts/',
			devVendorDir : devDir + 'vendor/',

			buildJsDir : buildDir + 'js/',
			buildCssDir : buildDir + 'css/',
			buildImgDir : buildDir + 'img/',
			buildFontsDir : buildDir + 'fonts/',
			buildVendorDir : buildDir + 'vendor/',

			distJsDir : distDir + 'js/',
			distCssDir : distDir + 'css/',
			distImgDir : distDir + 'img/',
			distFontsDir : distDir + 'fonts/',
			distVendorDir : distDir + 'vendor/',

		};

	/*
	 * Load tasks
	 */
	require( 'load-grunt-config' )( grunt, {
		configPath : require( 'path' ).join( process.cwd(), 'grunt-configs' ),
		data : options
	} );

	if ( options.isDev ) {
		grunt.log.subhead( 'Running Grunt in DEV mode' );
	}

	/*
	 * Register tasks
	 */

	grunt.registerTask( 'build', [ 'clean:build', 'compile:css', 'compile:js', 'copy:vendor', 'growl:complete' ] );
	grunt.registerTask( 'default', [ 'build', 'watch' ] );

	/*
	 * Stylesheets
	 */
	grunt.registerTask( 'compile:css', function () {

		grunt.task.run( [ 'sass', 'autoprefixer', 'cssmin', 'copy:css' ] );

		// if ( ! options.isDev ) {
		// 	grunt.task.run( [ 'cssmin' ] );
		// }

	} );

	grunt.registerTask( 'lint:css', [ 'newer:scsslint' ] );

	/*
	 * Javascripts
	 */
	grunt.registerTask( 'compile:js', function () {

		grunt.task.run( [ 'lint:js', 'concat', 'uglify', 'copy:js' ] );

		// if ( ! options.isDev ) {
		// 	grunt.task.run( [ 'uglify' ] );
		// }

	} );

	grunt.registerTask( 'lint:js', [ 'newer:jshint:common' ] );

};
