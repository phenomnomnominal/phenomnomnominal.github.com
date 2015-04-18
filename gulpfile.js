'use strict';

var gulp = require('gulp');

var bundle = require('./build/bundle');
var fonts = require('./build/fonts');
var images = require('./build/images');
var lint = require('./build/lint');
var content = require('./build/content');
var markup = require('./build/markup');
var reload = require('./build/reload');
var styles = require('./build/styles');
var test = require('./build/test');
var watch = require('./build/watch');

gulp.task('fonts', fonts);

gulp.task('images', images);

gulp.task('bundle', bundle);

gulp.task('lint-client', ['bundle'], lint.client);

gulp.task('test-client', ['lint-client'], test.client);

gulp.task('markup', markup);
gulp.task('content', content);
gulp.task('styles', styles);

gulp.task('reload', reload);
gulp.task('watch', ['reload'], watch);

gulp.task('default', ['fonts', 'images', 'markup', 'content', 'styles', 'test-client', 'watch']);
