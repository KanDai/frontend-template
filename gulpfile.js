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


// タスク
// ------------------------------------------


// Jade
gulp.task('jade', function () {
  gulp.src(['./dev/jade/*.jade','src/jade/**/*.jade'])
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    /*.pipe(data(function(file) {
      return require('./data.json');
    }))*/
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./htdocs/'));
});

// ejs
gulp.task("ejs", function() {
  gulp.src(["./dev/ejs/**/*.ejs",'!' + "./dev/ejs/**/_*.ejs"])
  .pipe(ejs( {
        date: JSON.parse(fs.readFileSync('./dev/json/date.json'))
      },
      {
        ext: '.html'
      }
  ))
  .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
  .pipe(gulp.dest('./htdocs/'));
});


// Sassのコンパイルと圧縮
gulp.task('sass' , function(){
  gulp.src('./dev/scss/*.scss')
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    // .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer('last 3 version'))
    .pipe(csscomb())
    // .pipe(sourcemaps.write('./maps/')) // マップファイルを出力するパスを指定します
    .pipe(gulp.dest('./htdocs/css'))
    .pipe(minify({compatibility: 'ie8'}))
    .pipe(rename({ extname : '.min.css' }))
    .pipe(gulp.dest('./htdocs/css'));
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
  gulp.src(['./htdocs/js/*.js', '!' + './htdocs/js/*.min.js'])
    .pipe( jshint() )
    .pipe( jshint.reporter( 'jshint-stylish' ) );
});

// htmlLint
gulp.task('htmllint', function() {
    gulp.src('./htdocs/**/*.html')
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
});

// _で始まるjsを結合
// 圧縮して生成
gulp.task( 'js', function () {
  gulp.src( './dev/js/_*.js' )
    .pipe( plumber({errorHandler: notify.onError('<%= error.message %>')}) )
    .pipe( concat( 'common.js' ) )
    .pipe(gulp.dest('./htdocs/js/'))
    .pipe( uglify( {
      preserveComments: 'some'
    } ) )
    .pipe(rename({ extname : '.min.js' }))
    .pipe(gulp.dest('./htdocs/js/'));
} );

var destImg = './htdocs/images/';

// imageminで画像を圧縮
gulp.task( 'imagemin', function () {
  gulp.src( [ './dev/images/**/*.png' ] )
    .pipe(changed( destImg ))
    .pipe(pngquant( { quality: '65-80', speed: 1 })() )
    .pipe(gulp.dest( destImg ));
  gulp.src( [ './dev/images/**/*.jpg' ] )
    .pipe(changed( destImg ))
    .pipe(jpegtran({progressive: true})())
    .pipe(gulp.dest( destImg ));
  gulp.src( [ './dev/images/**/*.gif' ] )
    .pipe(changed( destImg ))
    .pipe(gifsicle({interlaced: true})())
    .pipe(gulp.dest( destImg ));
  gulp.src( [ './dev/images/**/*.svg' ] )
    .pipe(changed( destImg ))
    .pipe(svgo()())
    .pipe(gulp.dest( destImg ));
});

// sprite画像を生成
gulp.task( 'sprite', function () {
  var spriteData = gulp.src( './dev/images/sprite/*.png' )
  .pipe( sprite( {
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: '_sprite.scss',
    padding: 5
  } ) );
  spriteData.img
    .pipe(pngquant( { quality: '65-80', speed: 1 })() )
    .pipe( gulp.dest( './htdocs/images/' ) );
  spriteData.css
    .pipe( gulp.dest( './dev/scss/' ) );
} );

// サーバーの起動
gulp.task('server', function() {
  browserSync({
    server: {
      baseDir: './htdocs'
    }
  });
});

// gulpの実行とファイルの監視
gulp.task('default', ['server'], function() {
  gulp.watch([
    './htdocs/**/*.html',
    './htdocs/**/*.css',
    './htdocs/**/*.js',
    './htdocs/**/*.jpg',
    './htdocs/**/*.png',
    './htdocs/**/*.svg',
  ], browserSync.reload);
  //gulp.watch(['./dev/ejs/*.ejs','./dev/ejs/**/*.ejs'], ['ejs']);
  //gulp.watch(['./dev/jade/*.jade','./dev/jade/**/*.jade'], ['jade']);
  gulp.watch(['./dev/scss/*.scss','./dev/scss/**/_*.scss'],['sass']);
  gulp.watch(['./dev/js/*.js'],['js']);
  gulp.watch(['./dev/images/sprite/*.png' ], [ 'sprite' ]);
  gulp.watch(['./dev/images/*' ], [ 'imagemin' ]);
});
