// gulpプラグインの読み込み
// ------------------------------------------
var fs           = require('fs');
var gulp         = require('gulp');
var ejs          = require('gulp-ejs');          //ejs
var jade         = require('gulp-jade');         //Jade
var sass         = require('gulp-sass');         //SASSコンパイル
var csscomb      = require('gulp-csscomb');      //CSS順番
var autoprefixer = require('gulp-autoprefixer'); //自動でprefixつける
var minify       = require('gulp-minify-css');   //CSS圧縮
var rename       = require('gulp-rename');       //リネーム
var plumber      = require('gulp-plumber');      //エラーが出ても動作を止めない
var notify       = require('gulp-notify');       //エラー時に通知
var browserSync  = require('browser-sync');      //ローカルホストとオートリロード
var sprite       = require('gulp.spritesmith');  //CSS Sprite生成
var imagemin     = require('gulp-imagemin');     //画像圧縮
var changed      = require('gulp-changed');      //変更したファイルだけ処理させる
var pngquant     = require('imagemin-pngquant'); //PNGの圧縮率を髙く
var jpegtran     = require('imagemin-jpegtran'); //JPGの圧縮率を髙く
var gifsicle     = require('imagemin-gifsicle'); //GIFの圧縮率を髙く
var svgo         = require('imagemin-svgo');     //SVGの圧縮率を髙く
var concat       = require('gulp-concat');       //ファイルの結合
var uglify       = require('gulp-uglify');       //特定のコメントを残したまま圧縮
var styledocco   = require('gulp-styledocco');   //スタイルガイド作成用
var stylestats   = require('gulp-stylestats');   //StyleStats
var jshint       = require('gulp-jshint');       //jshint
var htmlhint     = require("gulp-htmlhint");     //htmlhint
var sourcemaps   = require('gulp-sourcemaps');


// 変数設定
// ------------------------------------------

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



// タスク
// ------------------------------------------


// Jade
gulp.task('jade', function () {
  gulp.src([src.base + '**/*.jade', '!' + src.base + '**/_*.jade'])
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    /*.pipe(data(function(file) {
      return require('./data.json');
    }))*/
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(dist.base));
});

// ejs
gulp.task('ejs', function() {
  gulp.src([ src.base + '**/*.ejs', '!' + src.base + '**/_*.ejs' ])
  .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
  .pipe(ejs({
        site: JSON.parse(fs.readFileSync( src.base + 'config/site.json'))
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


// スタイルガイドの作成
// _で始まるのは除外設定してるのにされない…
gulp.task('styledocco', function () {
  gulp.src(['./dev/scss/*.scss', '!./dev/scss/_*.scss'])
    .pipe(styledocco({
      out: './guide',
      name: 'My Project',
      'no-minify': true
  }));
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



// imageminで画像を圧縮
gulp.task( 'imagemin', function () {
  gulp.src( [ src.img + '**/*.png' ] )
    .pipe(changed( dist.img ))
    .pipe(pngquant( { quality: '65-80', speed: 1 })() )
    .pipe(gulp.dest( dist.img ));
  gulp.src( [ src.img + '**/*.jpg' ] )
    .pipe(changed( dist.img ))
    .pipe(jpegtran({progressive: true})())
    .pipe(gulp.dest( dist.img ));
  gulp.src( [ src.img + '**/*.gif' ] )
    .pipe(changed( dist.img ))
    .pipe(gifsicle({interlaced: true})())
    .pipe(gulp.dest( dist.img ));
  gulp.src( [ src.img + '**/*.svg' ] )
    .pipe(changed( dist.img ))
    .pipe(svgo()())
    .pipe(gulp.dest( dist.img ));
});

// sprite画像を生成
gulp.task( 'sprite', function () {
  var spriteData = gulp.src( src.img + 'sprite/*.png' )
  .pipe( sprite( {
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: '_sprite.scss',
    padding: 5
  } ) );
  spriteData.img
    .pipe(pngquant( { quality: '65-80', speed: 1 })() )
    .pipe( gulp.dest( dist.img ) );
  spriteData.css
    .pipe( gulp.dest( src.scss ) );
} );

// サーバーの起動
gulp.task('server', function() {
  browserSync({
    server: {
      baseDir: dist.base
    }
  });
});

// gulpの実行とファイルの監視
gulp.task('default', ['server'], function() {
  gulp.watch([
    dist.base + '**/*.html',
    dist.base + '**/*.css',
    dist.base + '**/*.js',
    dist.base + '**/*.jpg',
    dist.base + '**/*.png',
    dist.base + '**/*.svg',
  ], browserSync.reload);
  gulp.watch([ src.base + '**/*.ejs' ], ['ejs']);
  gulp.watch([ src.base + '**/*.jade' ], ['jade']);
  gulp.watch([ src.scss + '**/*.scss' ],['sass']);
  gulp.watch([ src.js + '**/*.js' ], ['js']);
  gulp.watch([ src.img + 'sprite/*.png' ], [ 'sprite' ]);
  gulp.watch([ src.img + '*' ], [ 'imagemin' ]);
});
