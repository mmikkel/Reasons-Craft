module.exports = function ( grunt, options ) {
	var opts = options;
	return {
		dev : {
			files : [ {
				expand : true,
				cwd : opts.devCssDir,
				src : [
					'**/*.scss',
					'!**/_settings.scss',
					'!**/_foundationSettings.scss',
					'!**/_foundation.scss'
				],
				dest : opts.devCssDir
			} ]
		},
		options : {
			config : './resources/scsslint_conf.yml',
			compact : true
		}
	};
};
