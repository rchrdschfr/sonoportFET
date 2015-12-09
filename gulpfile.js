var gulp = require('gulp');
var browserify = require('gulp-browserify');
 
// Basic usage 
gulp.task('scripts', function() {
	// Single entry point to browserify 
	gulp.src('src/app.js')
		.pipe(browserify({
		  insertGlobals : true,
		}))
		.pipe(gulp.dest('./build/'))
});
gulp.task('watch', function() {
  gulp.watch('src/*', ['scripts']);
});
gulp.task('default', ['scripts', 'watch']);