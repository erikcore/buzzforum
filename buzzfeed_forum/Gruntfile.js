module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {
				reporter: require('jshint-stylish')
			},
			build: ['Gruntfile.js', 'forum_app/static/src/**/*.js']
		},

		uglify: {
			options: {
				banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
			},
			build: {
				files: {
					'forum_app/static/dist/js/app.min.js': 'forum_app/static/dist/js/app.js'
				}
			}
		},

		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015', 'react']
			},
			dist: {
				files: {
					'forum_app/static/dist/js/app.js': 'forum_app/static/src/js/app.jsx'
				}
			}
		},

		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'forum_app/static/dist/css',
					src: ['*.css', '!*.min.css'],
					dest: 'forum_app/static/dist/css',
					ext: '.min.css'
				}]
			}
		},

		watch: {
			react: {
				files: 'forum_app/static/src/js/app.jsx',
				tasks: ['babel', 'uglify', 'cssmin']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['babel']);

};