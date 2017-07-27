/*========================================*/
/* Gulp plugin
/*========================================*/

var fs           = require('fs');
var gulp         = require('gulp');
var watch        = require('gulp-watch');        //追加ファイルも検知する
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
var pngquant     = require('imagemin-pngquant'); //PNGの圧縮率を髙く
var changed      = require('gulp-changed');      //変更したファイルだけ処理させる
var cached       = require('gulp-cached');       //変更したファイルだけ処理させる
var concat       = require('gulp-concat');       //ファイルの結合
var uglify       = require('gulp-uglify');       //特定のコメントを残したまま圧縮
var htmlhint     = require("gulp-htmlhint");     //htmlhint
var jshint       = require('gulp-jshint');       //jshint
// var stylestats   = require('gulp-stylestats');   //StyleStats
var sourcemaps   = require('gulp-sourcemaps');   //ソースマップ出力
var hologram     = require('gulp-hologram');     //GulpからHologram実行
var iconfont     = require('gulp-iconfont');     //アイコンフォント作成
var consolidate  = require('gulp-consolidate');  //Lo-DashをGulpから使えるようにする
var webpack      = require('gulp-webpack');      //webpack


/*========================================*/
/* Setting
/*========================================*/

// 対象ブラウザ
var AUTOPREFIXER_BROWSERS = [
    'last 3 versions',
    'ie >= 9',
    'iOS >= 8',
    'Android >= 4.2'
];
// 開発環境パス
var src = {
    base: './dev/',
    scss: './dev/assets/scss/',
    js  : './dev/assets/js/',
    img : './dev/assets/images/',
};
// 出力環境パス
var dist = {
    base: './htdocs/',
    css : './htdocs/assets/css/',
    js  : './htdocs/assets/js/',
    img : './htdocs/assets/images/',
};


/*========================================*/
/* Task
/*========================================*/

/**
 * ejsのコンパイル
 */
gulp.task('ejs', function() {
  gulp.src([ src.base + '**/*.ejs', '!' + src.base + '**/_*.ejs' ])
  .pipe(cached('ejs'))
  .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
  .pipe(ejs({
        site: JSON.parse(fs.readFileSync( src.base + 'inc/config.json')),
        pages: JSON.parse(fs.readFileSync( src.base + 'inc/pages.json'))
      },
      {
        ext: '.html'
      }
  ))
  .pipe(gulp.dest(dist.base));
});


/**
 * Sassのコンパイルと圧縮
 */
gulp.task('sass' , function(){
  return gulp.src( src.scss + '*.scss' )
    .pipe(cached('sass'))
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
        browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe(csscomb())
    .pipe(sourcemaps.write('maps', {
      includeContent: false,
      sourceRoot: dist.css + 'maps'
    }))
    .pipe(gulp.dest(dist.css))
    .pipe(minify())
    .pipe(rename({ extname : '.min.css' }))
    .pipe(gulp.dest(dist.css));
});


/**
 * jsの結合・圧縮・コピーの処理まとめ
 * デフォルトではWebpackの処理のみ
 */

// Webpackでjs結合
gulp.task( 'webpack', function () {
  var webpackConfig = require('./webpack.config.js');

  gulp.src( src.js + '*.js')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(dist.js));
});

// concatでjs結合(結合ファイルは指定)
gulp.task( 'js_concat', function () {
  gulp.src([
        src.js + 'xx1.js',
        src.js + 'xx2.js'
    ])
    .pipe( plumber({errorHandler: notify.onError('<%= error.message %>')}) )
    .pipe( concat( 'xxx.js' ) )
    .pipe(gulp.dest(dist.js))
    .pipe( uglify( {
      preserveComments: 'some'
    } ) )
    .pipe(rename({ extname : '.min.js' }))
    .pipe(gulp.dest(dist.js));
});

// そのまま出力したいjsファイルを指定して出力領域にそのまま出力と圧縮しての出力
gulp.task( 'js_copy', function () {
  gulp.src([
        src.js + 'xx1.js',
        src.js + 'xx2.js'
    ])
    .pipe( plumber({errorHandler: notify.onError('<%= error.message %>')}) )
    .pipe(gulp.dest(dist.js))
    .pipe( uglify( {
      preserveComments: 'some'
    } ) )
    .pipe(rename({ extname : '.min.js' }))
    .pipe(gulp.dest(dist.js));
});

// 処理をまとめて実行
gulp.task('js', function() {
    gulp.start( 'webpack' );
    // gulp.start( 'js_concat' );
    // gulp.start( 'js_copy' );
});


/**
 * imageminで画像を圧縮
 * changedを使用して変更のあった画像だけ処理
 * PNGは圧縮率の高いpngquantを使用
 */
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
    .pipe(gulp.dest( dist.img ));
});


/**
 * 指定フォルダ内のSVGファイルからIconfont作成
 * 読み込み用のscssファイルとStyleGuide用のscssファイルを生成
 * ファイル監視はせずに手動実行
 */
gulp.task('iconfont', function(){
  var fontName = 'icon';

  return gulp.src(['./dev/assets/icons/*.svg'])
    .pipe(iconfont({
      fontName: fontName,
      prependUnicode: true,
      formats: ['ttf', 'eot', 'woff']
    }))
    .on('glyphs', function(codepoints, options) {
      var engine             = 'lodash';
      var templatePath       = './dev/assets/icons/template/';
      var templateName       = '_icon';
      var consolidateOptions = {
        glyphs: codepoints,
        fontName: fontName,
        fontPath: '../fonts/',
        className: 'icon'
      };

      //scss生成
      gulp.src(templatePath + templateName + '.scss')
        .pipe(consolidate(engine, consolidateOptions))
        .pipe(rename({ basename: '_iconfont' }))
        .pipe(gulp.dest(src.scss + 'base/'));

      //StyleGuide用のscss生成
      gulp.src(templatePath + templateName + '_doc.scss')
        .pipe(consolidate(engine, consolidateOptions))
        .pipe(rename({ basename:'_icon' }))
        .pipe(gulp.dest(src.base + 'docs/'));
    })

    .pipe(gulp.dest('./htdocs/assets/fonts/'));
});


/**
 * Gulpからhologramを実行してスタイルガイド作成
 * そのままGithub Pages用に[docs]にコピー
 */
gulp.task('hologram', ['styleguide'], function() {
  gulp.src("./htdocs/_docs/**/*")
    .pipe(gulp.dest("./docs"));
});

gulp.task('styleguide', function() {
  return gulp.src('./hologram/config.yml')
    .pipe(hologram());
});


/**
 * Lint系のタスク
 * ファイル監視はせずに手動実行
 */

// htmlLint
gulp.task('htmllint', function() {
    gulp.src(dist.base + '**/*.html')
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
});

// StyleStats
// gulp.task('stylestats', function () {
//   gulp.src('./htdocs/css/*.min.css')
//     .pipe(stylestats());
// });

// jshint
gulp.task('jshint', function() {
  gulp.src([ dist.js + '*.js', '!' + dist.js + '*.min.js'])
    .pipe( jshint() )
    .pipe( jshint.reporter( 'jshint-stylish' ) );
});

// 処理をまとめて実行
gulp.task('lint', function() {
    gulp.start( 'htmllint' );
    // gulp.start( 'stylestats' );
    gulp.start( 'jshint' );
});

/*========================================*/
/* Server / Watch
/*========================================*/

// ローカルサーバーの起動
// --------------------
gulp.task('server', function() {
  browserSync({
    server: {
      baseDir: dist.base
    }
  });
});

// ファイル監視
// --------------------
gulp.task('watch', function() {
    // 出力領域が更新されたらオートリロード
    watch([
        dist.base + '**/*.html',
        dist.base + '**/*.css',
        dist.base + '**/*.js',
        dist.base + '**/*.jpg',
        dist.base + '**/*.png',
        dist.base + '**/*.svg',
    ], function (){
        browserSync.reload();
    });

    // 開発環境のファイルを監視
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
    watch( [ './dev/docs/*.scss', './hologram/**/*' ] , function () {
        gulp.start( 'hologram' );
    });
});

// gulpコマンドでサーバー起動とファイル監視
gulp.task('default', ['server', 'watch'] );
