# Frontend Template
個人的なフロントエンド開発環境のテンプレート。

タスクランナーで `Gulp` を使用。タスクをまとめて色々やっています。

## 概要
- タスクランナー : gulp
- CSS : Sass(Scss記法)
- AltJS : 無し(webpack / concatでの結合処理あり)
- htmlテンプレート : ejs

#### 検証環境
- Mac OSX Yosemite(10.10)
- Node v5.8.0(4以上とかだったら動くと思う)

## インストール

コマンドラインでディレクトリまで移動して、`npm install` <br>
nodeとgulpはインストールされている前提。インストールされていなければする。

```
$ npm install
```

## タスク

- ローカルサーバー / オートリロード / ファイル監視
- ejsのコンパイル
- Sassのコンパイル・プレフィックスの付与・圧縮
- JavaScriptの結合・圧縮・コピー
- 画像圧縮
- アイコンフォントの作成
- Lint
- hologramを実行してスタイルガイド作成

### ローカルサーバー / オートリロード / ファイル監視

ローカルサーバーが立ちあがり、ファイルの監視が始まります。

```
$ gulp
```

開発環境の `ejsファイル` `scssファイル` `jsファイル` `画像` `スタイルガイド関連ファイル`がそれぞれ監視されて、変更されると出力環境にファイルが生成される。
出力環境に生成されたファイルの変更を感知するとオートリロード。


### ejsのコンパイル

開発環境のejsファイルをコンパイルして出力環境に。
サイト設定用のjsonファイルを読み込んで使用できる。

```
$ gulp ejs
```

jade(pug)よりもejsを使っているのは、ほぼHTMLで書けるのでスタイルガイドと相性が良いと考えているため。


### Sassのコンパイル・プレフィックスの付与・圧縮

開発環境のscssファイルをコンパイルして出力環境に。

```
$ gulp sass
```
- CSSの記述順並び替え(.csscomb.jsonで設定)
- プレフィックスの付与(gulpfile.js内で設定)
- ソースマップの出力
- 圧縮

が同時に行われます。


### JavaScriptの結合・圧縮・コピー

開発環境のJavaScriptファイルをコンパイルして出力環境に。

```
$ gulp js
```

- webpackを使ったJavaScriptの結合
- `gulp-concat`を使った結合(ファイルは指定)
- 開発環境のJavaScriptをそのままコピー(ファイルは指定)

がタスクとしてありますが、デフォルトではwebpackのみ実行。
下2つはコメントアウトしてるので必要な時に。



### 画像圧縮

開発環境の画像を圧縮して出力環境に。

```
$ gulp imagemin
```

`gulp-changed` を使用して変更のあった画像だけ処理されます。PNGは圧縮率の高いpngquantを使用。


### アイコンフォントの作成

`/dev/assets/icons/` 内のSVGファイルをアイコンフォントにします。
ファイル監視はなく、手動実行です。

```
$ gulp iconfont
```

`/dev/assets/icons/template/_icon.scss` をベースにiconfont出力用のcss(scss)が生成されます。
`/dev/assets/icons/template/_icon_doc.scss` をベースにスタイルガイド用のcss(scss)が生成されます。


### Lint

生成されたHTML・CSS・JSをチェックします。
ファイル監視はなく、手動実行です。

```
$ gulp lint
```


### hologramを実行してスタイルガイド作成

gulpからhologramを実行するタスクです。
詳しくは、この下の `スタイルガイド / ドキュメント` に詳しく書いてます。


## スタイルガイド / ドキュメント

`hologram`を使用しています。
`/htdocs/_doc/` に生成され `/docs/`にコピー(GitHub Pages用)されます。

スタイルガイド用の記述は `/dev/assets/docs/` に1ページ分を1ファイルにまとめて書いています。
モジュールごとに書くとコンパイルされたCSSにコメントが残るのが嫌なので。

### インストール / 実行

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

またはgulpのタスクから実行も可能

$ gulp hologram
```

`Gulp` コマンドの実行中は、`/hologram/` `/dev/assets/docs/` を監視して、ディレクトリ内のファイルが更新された場合は、スタイルガイドの生成が自動で行われます。


### カスタマイズ

`/hologram/` 内に入っている、テンプレートのHTMLやCSSファイルをいじってください。


### 書き方サンプル
<pre>
/*doc
---
title: ボタン
name: 02-button
category: components
---

ここはマークダウンで記載できます。HTMLも使えます。

```example
<a href="#" class="btn">ここにHTMLを書きます</a>
```
*/
</pre>
title　→　見出し、とローカルナビが生成されます

name　→　IDに使用されます。接頭辞に数字をつけることでページ内の順番がコントロールできます。

category　→　category単位でページが生成されます


## 構成

### /dev/
開発領域。

- xxx.ejs : ejsファイル。出力領域の同じ構造でhtml出力
- assets/scss : scssファイルを格納
- assets/js : jsファイルを格納。
- assets/images : 画像ファイルを格納。
- assets/icons : iconfont用のsvgファイルを格納
- docs: スタイルガイド用のscssファイルを格納
- inc: ejsのモジュール・設定ファイルなど格納


### /htdocs/
出力領域。ローカルサーバーのドキュメントルートになります。

開発環境から生成されたデータはバージョン管理から外しています。

### /hologram/
ホログラムの設定ファイルやテンプレート格納先。

### /docs/
GitGub Pages用のスタイルガイド生成先。
