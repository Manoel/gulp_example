var gulp = require('gulp');

var sass = require('gulp-sass');

var browserSync = require('browser-sync').create();

var useref = require('gulp-useref');

var uglify = require('gulp-uglify');

var gulpIf = require('gulp-if');

var cssnano = require('gulp-cssnano');

var imagemin = require('gulp-imagemin');

var cache = require('gulp-cache');

var del = require('del');

var runSequence = require('run-sequence');

var pkg = require('./package.json');

var header = require('gulp-header');

var rename = require('gulp-rename');

var revAll = require('gulp-rev-all');
 
gulp.task('rev-all', function () {
  return gulp
    .src('dist/**')
    .pipe(revAll.revision({dontRenameFile: ['index.html'] }))	
    .pipe(gulp.dest('cdn'));
 
});

var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

gulp.task('sass', function() {
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		}
	});
});

gulp.task('useref', function() {
	return gulp.src('app/*.html')
		.pipe(useref(pkg.version))
		.pipe(gulpIf('*.js', uglify()))		
		.pipe(gulpIf('*.css', cssnano()))		
		.pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
	return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
		.pipe(cache(imagemin({
			interlace: true
		})))		
		.pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});

gulp.task('cache:clear', function (callback) {
	return cache.clearAll(callback);
});

gulp.task('watch', ['browserSync', 'sass'], function() {
	gulp.watch('app/scss/**/*.scss', ['sass']);	
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  );
});

gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['sass', 'useref', 'images', 'fonts'],
    callback
  );
});

