'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				curly: false,		// require {} braces around blocks
				eqeqeq: true,		// require use of === and !== equality comparison to prevent value coercion
				eqnull: true,		// suppress warnings about == null comparisons
				immed: true,		// require immediate function invocations be wrapped in parenthesis
				latedef: true,		// require variable be defined before use
				undef: true,		// requires all variable be properly declared
				unused: "vars",		// warns about unused variables
				sub: true,			// allow access objects w/ ['name'] notation -- necessary as some returned objects violate camelcase
				multistr: true		// allow multi-line strings
			},

			// set the file src and also making sure  node: true to avoid 'require' is not defined
			server: {
				options: {
					node: true
				},
				files: {
					src: [
						'server.js',
						'routes.js',
						'config/**/*.js',
						'controllers/**/*.js',
						'models/**/*.js',
						'utils/**/*.js'
					]
				}
			}
		},
		
		// set the watch list and use jshint for the change
		watch: {
			scripts: {
				files: ['**/*.js'],
				tasks: ['jshint'],
				options: {
					spawn: false,
				},
			},
		},
		
		// express server setup 
		express: {
			options: {
        port: process.env.PORT || 9601
      },
			dev: {
				options: {
					script: 'server.js'
				}
			}
		},
		
		// open the weburl once the express server is ready. Need to make sure delay if enough so that the express server is ready
		open: {
			dev: {
				path: 'http://localhost:9601/api/v1/docs/',
				options: {
					delay: 1000
				}
			}
		}
	});
	
	// load the plugins
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-open');
	
	// register tasks
	grunt.registerTask('default', ['jshint:server', 'express:dev', 'open:dev', 'watch:scripts']);
};