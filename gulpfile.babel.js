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
  css: './src/*.css',
  dts: './src/*.d.ts'
};

function minifyJS() {
  return src(path.js)
    .pipe(babel({ retainLines: true }))
    .pipe(replace('"use strict";', ''))
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

function copySourceCSS() {
    return src(path.css).pipe(dest(path.dist));
}

function copySourceDts() {
  return src(path.dts).pipe(dest(path.dist));
}

function watchFiles() {
  watch(path.js, minifyJS);
  watch(path.css, parallel(minifyCSS, copySourceCSS, copySourceDts));
}

export const build = parallel(minifyJS, minifyCSS, copySourceCSS, copySourceDts);

export default series(build, watchFiles);


