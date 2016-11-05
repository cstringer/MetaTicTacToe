module.exports = function(grunt) {
    grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

        less: {
            target: {
                files: [{
                    cwd:    'css',
                    dest:   'css',
                    expand: true,
                    ext:    '.css',
                    src:    '*.less'
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('buildall', ['less']);
};
