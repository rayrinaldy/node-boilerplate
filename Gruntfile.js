module.exports = function(grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		sass : {
			dist : {
				files : {
					'public/css/style.css': 'assets/scss/style.scss',
				}
			},
			bootstrap : {
				files : {
					'public/css/bootstrap.css': 'assets/scss/bootstrap/bootstrap.scss',
					'public/css/ui.css': 'assets/scss/now-ui-kit.scss',
				}
			},
		},
		watch : {
			pug: {
				files: ['views/*.pug'],
				options: {
					event: ['changed'],
					livereload: true,
					spawn: false
				}
			},
			sass : {
				files : ['assets/scss/**/*.scss'],
				tasks : 'sass:dist',
				options : {
					event : ['changed'],
					livereload : true,
					spawn: false
				}
			},
			express: {
				files: [
					'app.js',
					'routes/*.js',
					'routes/**/*.js',
					'auth/*.js',
					'lib/*.js',
				],
				tasks: ['express:dev', 'delay'],
				options: {
					event: ['changed'],
					spawn: false,
					interrupt: true,
					livereload: true
				}
			}
		},
		express: {
			dev: {
				options: {
					script: 'bin/www',
					livereload: false,
					harmony: true,
					background: true,
					debug: false,
				}
			},
			live: {
				options: {
					script: 'bin/www',
					livereload: false,
					harmony: true,
					background: false
				}
			}
		},
	});

	grunt.registerTask('delay', 'Delay for express restart', function() {
		setTimeout(this.async(), 1200);
	});

	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-express-server');

	grunt.registerTask('default', ['express:dev', 'watch']);
};

