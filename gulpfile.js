const gulp = require('gulp');
const eslint = require('gulp-eslint');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

const configs = {
  eslint: {
    src: [
      '*.js',
    ]
  },
  uglify: {
    dest: 'dist/',
    src: ['src/smart-hint.js']
  }
};

gulp.task('uglify', function() {
  return gulp.src(configs.uglify.src)
    .pipe(terser({
      compress: false,
      mangle: false
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(configs.uglify.dest));
});

gulp.task('eslint', function() {
  return gulp.src(configs.eslint.src)
    .pipe(eslint({quiet: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('build',
  gulp.series('eslint', 'uglify'));