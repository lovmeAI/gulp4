const {src, dest, watch, series, parallel} = require('gulp');
const rename = require('gulp-rename');
const bs = require('browser-sync').create();
const del = require("del");
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const util = require("gulp-util");
const maps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const cssnano = require("gulp-cssnano");
// 替换html样式与脚本路径
const revCollector = require('gulp-rev-collector');
// 压缩html
const minHtml = require('gulp-htmlmin');
const replace = require('gulp-replace');
// 压缩图片
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');

const conf = {
    dest: 'static/dest/',                           // 生产路径
    src: 'static/static/',                          // 项目源文件路径
    watch: {queue: true, events: 'all'},            // 文件监听配置
};

// twig模板编译报错处理
const reg_open = /\{\% if[^}]+\%\}/;
const reg_close = /\{\%[^}]+endif \%\}/;
const reg_box = [reg_open, reg_close];
// 正则匹配编译多余空格问题
const rmspaceOpen = /\%\}\s+\{\{/g;
const rmspaceClose = /\}\}\s+\{\%/g;

// 删除Html文件
let delHtmlFile = () => {
    return del([conf.dest + 'html'])
};

// 删除Css文件
let delCssFile = () => {
    return del([conf.dest + 'css'])
};

// 删除Js文件
let delJsFile = () => {
    return del([conf.dest + 'js'])
};

// 删除Js文件
let delImgFile = () => {
    return del([conf.dest + '**/images/**'])
};

// 压缩html
let freshHtml = series(delHtmlFile, () => {
    return src(conf.src + '*.html')
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'js': conf.dest,
                'css': conf.dest
            }
        }))
        .pipe(minHtml({
            collapseWhitespace: true,
            removeComments: false,
            removeEmptyAttributes: true,
            customAttrSurround: [reg_box],
            ignoreCustomFragments: [reg_open]
        }))
        .pipe(replace(rmspaceOpen, '%}{{'))
        .pipe(replace(rmspaceClose, '}}{%'))
        .pipe(dest(conf.dest))
        .pipe(bs.stream())
});

// 编译css(scss)
let compileCss = series(delCssFile, () => {
    return src(conf.src + 'css/**/*.scss')
        .pipe(maps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(dest(conf.dest + 'css/'))
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(maps.write('maps', {addComment: false}))
        .pipe(dest(conf.dest + 'css/'))
        .pipe(bs.stream())
});

// 编译js
let compileJs = series(delJsFile, () => {
    return src(conf.src + 'js/**/*.js')
        .pipe(maps.init())
        .pipe(babel())
        .pipe(dest(conf.dest + 'js/'))
        .pipe(uglify().on("error", util.log))
        .pipe(rename({suffix: '.min'}))
        .pipe(maps.write('maps', {addComment: false}))
        .pipe(dest(conf.dest + 'js/'))
        .pipe(bs.stream())
});

// 压缩图片(png,jpg)
let compileImg = series(delImgFile, () => {
    return src([conf.src + '**/images/**'])
        .pipe(cache(imagemin()))
        .pipe(dest(conf.dest))
        .pipe(bs.stream())
});

// 复制其他文件
let copyFile = () => {
    return src([conf.src + '**fonts/**'])
        .pipe(dest(conf.dest + "fonts"))
        .pipe(bs.stream())
};

// 监听文件
let watchFiles = cb => {
    bs.init({
        server: {
            baseDir: conf.dest,
            livereload: true
        }
    });

    watch(conf.src + 'js/**/*.js', conf.watch, compileJs);
    watch(conf.src + 'css/**/*.scss', conf.watch, compileCss);
    watch(conf.src + '*.html', conf.watch, freshHtml);
    watch(conf.src + 'fonts/**/*.*', conf.watch, copyFile);
    watch([conf.src + 'images/**/*.png', conf.src + 'images/**/*.jpg'], conf.watch, compileImg);
    cb()
};

exports.default = series(parallel(compileJs, compileCss, compileImg, copyFile, freshHtml), watchFiles);

