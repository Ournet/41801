'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const config = require('./lib/config').default;
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
// const ico = require('gulp-to-ico');
// const sourcemaps = require('gulp-sourcemaps');

const mainSassFiles = ['./assets/scss/main.scss'];
const cssDist = './public/static/css';

gulp.task('sass-dev', function () {
  return gulp.src(mainSassFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(cssDist));
});

gulp.task('sass', function () {
  return gulp.src(mainSassFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(cssDist))
    // .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rev())
    .pipe(gulp.dest(cssDist))
    .pipe(rev.manifest({
      base: 'public',
      merge: true // merge with the existing manifest if one exists
    }))
    // .pipe(sourcemaps.write())
    // .pipe(rename({ basename: config.css.main }))
    .pipe(gulp.dest(cssDist));
});

gulp.task('sass:watch', function () {
  gulp.watch('./assets/scss/*.scss', ['sass-dev']);
});

const mainJsFiles = [
  './assets/js/jq-loader.js',
  './assets/js/nav.js',
  './assets/js/article.js',
];
const jsDist = './public/static/js';

gulp.task('js-dev', function () {
  return gulp.src(mainJsFiles)
    .pipe(concat('main.js'))
    .pipe(gulp.dest(jsDist));
});

gulp.task('js', function () {
  return gulp.src(mainJsFiles)
    .pipe(concat('main.js'))
    .pipe(gulp.dest(jsDist))
    // .pipe(cleanCSS())
    .pipe(rev())
    .pipe(gulp.dest(jsDist))
    .pipe(rev.manifest({
      base: 'public',
      merge: true // merge with the existing manifest if one exists
    }))
    // .pipe(sourcemaps.write())
    // .pipe(rename({ basename: config.css.main }))
    .pipe(gulp.dest(jsDist));
});

gulp.task('js:watch', function () {
  gulp.watch('./assets/js/*.js', ['js-dev']);
});

gulp.task('imagemin', () =>
  gulp.src('./assets/img/**/*.png')
    .pipe(imagemin())
    .pipe(gulp.dest('./public/static/img/'))
);

// gulp.task('favicon', function () {
//   return gulp.src('./public/favicon.png')
//     .pipe(ico('favicon.ico', { resize: false, sizes: [32] }))
//     .pipe(gulp.dest('./public/'));
// });

gulp.task('img', ['imagemin']);

gulp.task('prod', ['sass', 'js', 'img']);
gulp.task('default', ['img', 'sass-dev', 'js-dev', 'sass:watch', 'js:watch']);
