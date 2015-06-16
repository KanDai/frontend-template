/*
/* プラグイン読み込み
*/
var gulp         = require('gulp');
var ejs          = require('gulp-ejs');          //ejs
var jade         = require('gulp-jade');         //Jade
var sass         = require('gulp-sass');         //SASSコンパイル
var csscomb      = require('gulp-csscomb');      //CSS順番
var autoprefixer = require('gulp-autoprefixer'); //自動でprefixつける
var minify       = require('gulp-minify-css');   //CSS圧縮
var rename       = require('gulp-rename');       //リネーム
var plumber      = require('gulp-plumber');      //エラーが出ても動作を止めない
var browserSync  = require('browser-sync');      //ローカルホストとオートリロード
var imagemin     = require('gulp-imagemin');     //画像圧縮
var pngquant     = require('imagemin-pngquant'); //PNGの圧縮率を髙く
var jpegtran     = require('imagemin-jpegtran'); //JPGの圧縮率を髙く
var gifsicle     = require('imagemin-gifsicle'); //GIFの圧縮率を髙く
var svgo         = require('imagemin-svgo');     //SVGの圧縮率を髙く


var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var sprite       = require('gulp.spritesmith');


/*
/* タスク
*/

// Jade
gulp.task('jade', function () {
  gulp.src(['./dev/jade/*.jade','src/jade/**/*.jade'])
    .pipe(plumber())
    /*.pipe(data(function(file) {
      return require('./data.json');
    }))*/
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./htdocs/'));
});

// ejs
gulp.task("ejs", ['ejs-sp'], function() {
  gulp.src(["./dev/ejs/**/*.ejs",'!' + "./dev/ejs/**/_*.ejs"])
  .pipe(plumber())
  .pipe(ejs( { flag : 'pc'} ))
  .pipe(gulp.dest('./htdocs/'));
});

gulp.task("ejs-sp", function() {
  gulp.src(["./dev/ejs/**/*.ejs",'!' + "./dev/ejs/**/_*.ejs"])
  .pipe(plumber())
  .pipe(ejs( { flag : 'sp'} ))
  .pipe(gulp.dest('./htdocs/sp/'));
});

// Sassのコンパイル
gulp.task('sass' , function(){
  gulp.src('./dev/scss/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer('last 3 version'))
    .pipe(csscomb())
    .pipe(gulp.dest('./htdocs/css'));
});

// 圧縮
gulp.task('optimize', ['sass'], function() {
  gulp.src('./dev/scss/*.css')
    .pipe(minify({compatibility: 'ie8'}))
    .pipe(rename({ extname : '.min.css' }))
    .pipe(gulp.dest('./htdocs/css'));
});

// imageminで画像を圧縮
gulp.task( 'imagemin', function () {
  gulp.src( [ './dev/images/*.png' ] )
    .pipe(pngquant( { quality: '65-80', speed: 1 })() )
    .pipe(gulp.dest('./htdocs/images/' ));
  gulp.src( [ './dev/images/*.jpg' ] )
    .pipe(jpegtran({progressive: true})())
    .pipe(gulp.dest('./htdocs/images/' ));
  gulp.src( [ './dev/images/*.gif' ] )
    .pipe(gifsicle({interlaced: true})())
    .pipe(gulp.dest('./htdocs/images/' ));
  gulp.src( [ './dev/images/*.svg' ] )
    .pipe(svgo()())
    .pipe(gulp.dest('./htdocs/images/' ));
});


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
  gulp.watch(['./htdocs/**/*.html'], browserSync.reload);
  //gulp.watch(['./dev/ejs/*.ejs','./dev/ejs/**/*.ejs'], ['ejs' , browserSync.reload]);
  //gulp.watch(['./dev/jade/*.jade','./dev/jade/**/*.jade'], ['jade' , browserSync.reload]);
  gulp.watch(['./dev/scss/*.scss','./dev/scss/**/_*.scss'],['sass' , browserSync.reload]);
});
