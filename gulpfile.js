'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('test', function () {
  return gulp.src('tests/*.js', { read: false })
    .pipe(mocha({ ui: 'tdd' }));
});

gulp.task('lint', function() {
    return gulp.src('./{bin,lib,tests}/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
});