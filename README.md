# frontend-template
個人的なフロントの開発環境

## 開発環境

#### 基本構成

- Node : v5.8.0
- タスクランナー : gulp
- CSSプリプロセッサ : Sass(Scss記法)
- AltJS : 無し
- htmlテンプレート : ejs

#### Gulp

タスクランナーで`Gulp`を使っています。

Gulpでやっていること
- Sassのコンパイル・プレフィックスの付与・圧縮
- ローカルサーバー立ち上げ・オートリロード (browserSync)
- アイコンフォントの作成

```
$ gulp
```

でローカルサーバーが立ちあがりファイルの監視が始まります。

jsの結合と圧縮・画像の圧縮・スプライトの作成はタスクがありますが今はやっていません。
画像圧縮は最後にまとめてやろうと思っています。

#### Sass
CSSはSass（Scss記法）で書いたものを結合してコンパイルしています。
プレフィックスの付与は自動で行われます。

- 開発元： /dev/assets/scss/
- 出力先： /htdocs/assets/css/

```
$ gulp sass
```
でタスク実行。`gulp` コマンド実行中は、scssファイルを更新すると自動で実行されます。

#### ローカルサーバー (browserSync)

環境によって `gulpfile.js` を編集して使用してください。

ローカル環境にMovable Typeの環境を用意して使用する場合などはproxyを使用する
```
gulp.task('server', function() {
  browserSync({
    proxy: "http://xxxxxxxxxx",
  });
});
```

`htdocs` をドキュメントルートにする場合
```
gulp.task('server', function() {
  browserSync({
    server: {
       baseDir: dist.base
    }
  });
});
```

## ドキュメント

- 基本仕様
- CSSのレイアウト用クラス
- CSSモジュール
- アイコンフォント

に関して、`/htdocs/_doc/` にまとめています。

HTMLの雛形は `/template.html` です。


## 進め方・Gitに関して

開発段階では作業者単位でブランチを切って進める。

コミットメッセージに関しては特に指定はないが、他の人が見てもわかりやすいメッセージを心がける


## CMS

Movable Typeクラウド版を使用。

ステージング環境でMT構築 → 本番サーバーに同期

#### テンプレートファイル

`/htdocs/_mt_tmpl/` にMTのテンプレートファイルを格納。
ファイルのリンク機能を使ってこちらを参照するようにしています。

基本的に、管理画面で編集するのではなく、テンプレートファイルを編集してFTPでアップするようにして、テンプレートファイルのバージョン管理をしやすくする。


## ドキュメント / スタイルガイドの生成

`hologram`を使用しています。
スタイルガイド用の説明は `/dev/assets/scss/styleguide/` に1ページ分を1ファイルにまとめて書いています。
モジュールごとに書くとコンパイルされたCSSにコメントが残るのが嫌なので。

まず、`Bundler`がインストールされていない場合、次のコマンドでインストールします。

```
$ gem install bundler
```

`Gemfile`と同階層で `bundle install`を実行して、`hologram`をインストールします。

```
$ bundle install
```

スタイルガイドの生成は以下のコマンドを実行。

```
$ hologram hologram/config.yml
```
