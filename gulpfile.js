/* -------------------------------------------- */
/*  Gulp plugin
/* -------------------------------------------- */

var fs           = require('fs');
var gulp         = require('gulp');
var watch        = require('gulp-watch');
var ejs          = require('gulp-ejs');          //ejs
var sass         = require('gulp-sass');         //SASSコンパイル
var csscomb      = require('gulp-csscomb');      //CSS順番
var autoprefixer = require('gulp-autoprefixer'); //自動でprefixつける
var minify       = require('gulp-minify-css');   //CSS圧縮
var rename       = require('gulp-rename');       //リネーム
var plumber      = require('gulp-plumber');      //エラーが出ても動作を止めない
var notify       = require('gulp-notify');       //エラー時に通知
var browserSync  = require('browser-sync');      //ローカルホストとオートリロード
var imagemin     = require('gulp-imagemin');     //画像圧縮
var changed      = require('gulp-changed');      //変更したファイルだけ処理させる
var pngquant     = require('imagemin-pngquant'); //PNGの圧縮率を髙く
var concat       = require('gulp-concat');       //ファイルの結合
var uglify       = require('gulp-uglify');       //特定のコメントを残したまま圧縮
var stylestats   = require('gulp-stylestats');   //StyleStats
var jshint       = require('gulp-jshint');       //jshint
var htmlhint     = require("gulp-htmlhint");     //htmlhint
var sourcemaps   = require('gulp-sourcemaps');
var hologram     = require('gulp-hologram');


/* -------------------------------------------- */
/*  Setting
/* -------------------------------------------- */

// 対象ブラウザ
var AUTOPREFIXER_BROWSERS = [
    'last 3 versions',
    'ie >= 9',
    'iOS >= 8',
    'Android >= 4.2'
];
var src = {
    base: './dev/',
    scss: './dev/assets/scss/',
    js  : './dev/assets/js/',
    img : './dev/assets/images/',
};
var dist = {
    base: './htdocs/',
    css : './htdocs/assets/css/',
    js  : './htdocs/assets/js/',
    img : './htdocs/assets/images/',
};


/* -------------------------------------------- */
/*  Task
/* -------------------------------------------- */

// ejs
gulp.task('ejs', function() {
  gulp.src([ src.base + '**/*.ejs', '!' + src.base + '**/_*.ejs' ])
  .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
  .pipe(ejs({
        site: JSON.parse(fs.readFileSync( src.base + 'inc/config.json'))
      },
      {
        ext: '.html'
      }
  ))
  .pipe(gulp.dest(dist.base));
});


// Sassのコンパイルと圧縮
gulp.task('sass' , function(){
  gulp.src( src.scss + '*.scss' )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    // .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
        browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe(csscomb())
    // .pipe(sourcemaps.write('./maps/')) // マップファイルを出力するパスを指定します
    .pipe(gulp.dest(dist.css))
    .pipe(minify({ compatibility: 'ie8' }))
    .pipe(rename({ extname : '.min.css' }))
    .pipe(gulp.dest(dist.css));
});

// StyleStats
gulp.task('stylestats', function () {
  gulp.src('./htdocs/css/*.min.css')
    .pipe(stylestats());
});

// jshint
gulp.task('jshint', function() {
  gulp.src([ dist.js + '*.js', '!' + dist.js + '*.min.js'])
    .pipe( jshint() )
    .pipe( jshint.reporter( 'jshint-stylish' ) );
});

// htmlLint
gulp.task('htmllint', function() {
    gulp.src(dist.base + '**/*.html')
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
});

// commonフォルダのjsを結合・圧縮
// それ以外のjsはそのまま出力
gulp.task( 'js', function () {
  gulp.src([ src.js + '/common/script/*.js', '!' + src.js + '/common/script/!*.js' ])
    .pipe( plumber({errorHandler: notify.onError('<%= error.message %>')}) )
    .pipe( concat( 'script.js' ) )
    .pipe(gulp.dest(dist.js + 'common/'))
    .pipe( uglify( {
      preserveComments: 'some'
    } ) )
    .pipe(rename({ extname : '.min.js' }))
    .pipe(gulp.dest(dist.js + 'common/'));

  gulp.src([ src.js + '/common/lib/*.js', '!' + src.js + '/common/lib/!*.js' ])
    .pipe( plumber({errorHandler: notify.onError('<%= error.message %>')}) )
    .pipe( concat( 'lib.js' ) )
    .pipe(gulp.dest(dist.js + 'common/'))

  gulp.src([ src.js + '/**/*.js', '!' + src.js + '/common/**/*.js' ])
    .pipe(gulp.dest(dist.js));
});

// Gulpからhologram実行
// そのまま[docs]にコピー
gulp.task('hologram', ['styleguide'], function() {
  gulp.src("./htdocs/_docs/**/*")
    .pipe(gulp.dest("./docs"));
});

gulp.task('styleguide', function() {
  return gulp.src('./hologram/config.yml')
    .pipe(hologram());
});



// imageminで画像を圧縮
gulp.task( 'imagemin', function () {
  return gulp.src( [ src.img + '**/*' ] )
    .pipe(changed( dist.img ))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [
        { removeViewBox: false },
        { cleanupIDs: false }
      ],
      use: [
        pngquant({
          quality: '65-80',
          speed: 1
        })()
      ]
    }))
    // .pipe(changed( dist.img ))
    // .pipe(pngquant( { quality: '65-80', speed: 1 })() )
    .pipe(gulp.dest( dist.img ));
  // gulp.src( [ src.img + '**/*.jpg' ] )
  //   .pipe(changed( dist.img ))
  //   .pipe(jpegtran({progressive: true})())
  //   .pipe(gulp.dest( dist.img ));
  // gulp.src( [ src.img + '**/*.svg' ] )
  //   .pipe(changed( dist.img ))
  //   .pipe(svgo()())
  //   .pipe(gulp.dest( dist.img ));
});

// サーバーの起動
gulp.task('server', function() {
  browserSync({
    server: {
      baseDir: dist.base
    }
  });
});

// gulpの実行とファイルの監視
gulp.task('default', ['server', 'watch'], function() {
  gulp.watch([
    dist.base + '**/*.html',
    dist.base + '**/*.css',
    dist.base + '**/*.js',
    dist.base + '**/*.jpg',
    dist.base + '**/*.png',
    dist.base + '**/*.svg',
  ], browserSync.reload);
});

gulp.task('watch', function() {
    watch( src.base + '**/*.ejs' , function () {
        gulp.start( 'ejs' );
    });

    watch( src.scss + '**/*.scss' , function () {
        gulp.start( 'sass' );
    });

    watch( src.js + '**/*.js' , function () {
        gulp.start( 'js' );
    });

    watch( src.img + '**/*.*' , function () {
        gulp.start( 'imagemin' );
    });

    watch( './dev/docs/*.scss' , function () {
        gulp.start( 'hologram' );
    });
});
