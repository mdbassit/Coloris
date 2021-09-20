import { src, dest, parallel, series, watch } from 'gulp';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import replace from 'gulp-replace';


const path = {
  src: './src/*',
  dist: './dist',
  js: './src/*.js',
  css: './src/*.css'
};

function minifyJS() {
  return src(path.js)
    .pipe(babel())
    .pipe(replace('"use strict";\n', ''))
    // Output the non-minified version
    .pipe(dest(path.dist))
    // Minify and rename to *.min.js
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
    return src(path.css)
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


