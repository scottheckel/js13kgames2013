module.exports = function(grunt) {
	grunt.initConfig({
		cssmin: {
			combine: {
				files: {
					'min/client/s.css' : 'client/s.css'
				}
			}
		},
		uglify: {
			client: {
				files: {
					'min/client/all.js': ['client/states/*.js', 'client/*.js']
				}
			}
		},
		copy: {
			client: {
				src: 'client/*.html',
				dest: 'min/'
			},
			server: {
				src: 'server/**',
				dest: 'min/'
			}
		},
		compress: {
			client: {
				options: {
					archive: 'zipped/client.zip'
				},
				files: [
					{
						src: ['min/client/**'],
						expand: true
					}
				]
			},
			server: {
				options: {
					archive: 'zipped/server.zip'
				},
				files: [
					{
						src: ['min/server/**'],
						expand: true
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');

	grunt.registerTask('default', ['cssmin', 'copy', 'uglify', 'compress']);
};