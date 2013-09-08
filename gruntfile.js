module.exports = function(grunt) {
	grunt.initConfig({
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

	grunt.loadNpmTasks('grunt-contrib');

	grunt.registerTask('default', 'compress');
};