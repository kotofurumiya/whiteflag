import path from 'path';

import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import cssmin from 'gulp-cssmin';
import del from 'del';

import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackConfig from './webpack.config';

const SRC_PATH = 'src/ts';
const TS_BUILD_PATH = 'src/js';
const ELECTRON_BUILD_PATH = 'build/';

export const clean = () => del([TS_BUILD_PATH, ELECTRON_BUILD_PATH]);

export function copy() {
  return gulp.src([
    path.join(SRC_PATH, '**/*'),
    `!${path.join(SRC_PATH, '**/*.html')}`,
    `!${path.join(SRC_PATH, '**/*.css')}`,
    `!${path.join(SRC_PATH, '**/*.{ts,tsx}')}`
  ], {
    base: SRC_PATH
  })
    .pipe(gulp.dest(TS_BUILD_PATH));
}

export function minifyHtml() {
  return gulp.src(path.join(SRC_PATH, '**/*.html'))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest(TS_BUILD_PATH));
}

export function minifyCss() {
  return gulp.src(path.join(SRC_PATH, '**/*.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(TS_BUILD_PATH));
}

export function execWebpack() {
  return webpackStream({ config: webpackConfig}, webpack)
    .pipe(gulp.dest(TS_BUILD_PATH))
}

export const build = gulp.series(clean, gulp.parallel(copy, minifyHtml, minifyCss, execWebpack));
