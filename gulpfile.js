'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const config = require('./lib/config').default;
const rename = require('gulp-rename');
const rev = require('gulp-rev');
// const sourcemaps = require('gulp-sourcemaps');

gulp.task('sass-main', function () {
  return gulp.src('./assets/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/static/css'))
    // .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rev())
    .pipe(gulp.dest('./public/static/css'))
    .pipe(rev.manifest({
      base: 'public',
      merge: true // merge with the existing manifest if one exists
    }))
    // .pipe(sourcemaps.write())
    // .pipe(rename({ basename: config.css.main }))
    .pipe(gulp.dest('./public/static/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('default', ['sass-main']);
