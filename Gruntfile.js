module.exports = function(grunt) {
	grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

		less: {
			target: {
				files: [{
					expand:	true,
					cwd:	'css',
					dest:	'css',
					src:	'*.less',
					ext:	'.css'
				}]
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('buildall', ['less']);
};
