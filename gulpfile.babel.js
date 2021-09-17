import { src, dest, parallel, series, watch } from 'gulp';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';


const path = {
  src: './src/*',
  dist: './dist',
  js: './src/*.js',
  css: './src/*.css'
};

function minifyJS() {
  return src(path.js)
    .pipe(babel())
    .pipe(uglify({
      output: {
        comments: /^!/
      }
    }))
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(dest(path.dist));
}

function minifyCSS() {
  return src(path.css)
    .pipe(cleanCSS())
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(dest(path.dist));
}

function copySource() {
    return src(path.src)
        .pipe(dest(path.dist));
}

function watchFiles() {
  watch(path.js, series(minifyJS, copySource));
  watch(path.css, series(minifyCSS, copySource));
}

export default parallel(
  minifyJS, 
  minifyCSS, 
  copySource, 
  watchFiles
);


