const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const fileInclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

// Пути к файлам
const paths = {
  html: {
    src: 'src/html/pages/*.html',
    dest: 'dist/',
    watch: 'src/html/**/*.html'
  },
  scss: {
    src: 'src/scss/main.scss',
    dest: 'dist/css/',
    watch: 'src/scss/**/*.scss'
  },
  js: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/',
    watch: 'src/js/**/*.js'
  },
  // Изображения (favicon.png исключён)
  images: {
    src: [
      'src/images/**/*.{jpg,jpeg,png,gif,svg}',
      '!src/images/favicon.png'
    ],
    dest: 'dist/images/',
    watch: 'src/images/**/*'
  },
  favicon: {
    src: 'src/images/favicon.png',
    dest: 'dist/',
    watch: 'src/images/favicon.png'
  },
  fonts: {
    src: 'src/fonts/**/*.{ttf,otf,woff,woff2,eot}',
    dest: 'dist/fonts/',
    watch: 'src/fonts/**/*'
  }
};

// Очистка dist
const clean = () => del(['dist']);

// HTML (компоненты + минификация)
const html = () => {
  return gulp.src(paths.html.src)
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
};

// SCSS (sourcemaps, autoprefixer, minify)
const scss = () => {
  return gulp.src(paths.scss.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      silenceDeprecations: ['import']   // не выводит предупреждения о @import
    }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream());
};

// JS (минификация)
const js = () => {
  return gulp.src(paths.js.src)
    .pipe(uglify())
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream());
};

// --- Изображения для РАЗРАБОТКИ (просто копирование, быстро) ---
const imagesDev = () => {
  return gulp.src(paths.images.src, { encoding: false })
    .pipe(gulp.dest(paths.images.dest));
};

// --- Изображения для ПРОДАКШЕНА (сжатие) ---
const imagesProd = () => {
  return gulp.src(paths.images.src, { encoding: false })
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({ plugins: [{ removeViewBox: false }] })
    ]))
    .pipe(gulp.dest(paths.images.dest));
};

// --- WebP для ПРОДАКШЕНА (только для изображений, фавикон не трогаем) ---
const webpProd = () => {
  return gulp.src(paths.images.src, { encoding: false })
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest(paths.images.dest));
};

// Фавикон (просто копируем)
const favicon = () => {
  return gulp.src(paths.favicon.src, { encoding: false, allowEmpty: true })
    .pipe(gulp.dest(paths.favicon.dest))
    .pipe(browserSync.stream());
};

// Шрифты
const fonts = () => {
  return gulp.src(paths.fonts.src, { encoding: false })
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(browserSync.stream());
};

// Сервер и наблюдатели
const serve = () => {
  browserSync.init({
    server: { baseDir: 'dist' },
    notify: false,
    open: true
  });

  gulp.watch(paths.html.watch, html);
  gulp.watch(paths.scss.watch, scss);
  gulp.watch(paths.js.watch, js);
  gulp.watch(paths.images.watch, imagesDev);   // при разработке – просто копируем
  gulp.watch(paths.favicon.watch, favicon);
  gulp.watch(paths.fonts.watch, fonts);
};

// --- СБОРКИ ---
// Быстрая разработка (без сжатия изображений и webp)
const buildDev = gulp.series(clean, gulp.parallel(html, scss, js, imagesDev, favicon, fonts));

// Полная продакшен-сборка (со сжатием и webp)
const buildProd = gulp.series(clean, gulp.parallel(html, scss, js, imagesProd, webpProd, favicon, fonts));

// Экспорт задач
exports.clean = clean;
exports.html = html;
exports.scss = scss;
exports.js = js;
exports.imagesDev = imagesDev;
exports.imagesProd = imagesProd;
exports.webpProd = webpProd;
exports.favicon = favicon;
exports.fonts = fonts;
exports.build = buildProd;      // gulp build – полная оптимизация
exports.default = gulp.series(buildDev, serve);   // gulp – быстрая разработка