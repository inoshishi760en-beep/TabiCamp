# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

キャンプ場レビューとアウトドア情報を発信する静的HTMLブログ。ビルドプロセス不要の純粋なHTML/CSS/JavaScriptサイトで、GitHub Pagesでホストされている。

**公開URL**: https://yamazaki2357.github.io/camp-site/

## 開発環境

ローカルで確認する場合はHTTPサーバーを起動：

```bash
python3 -m http.server 8000
# または
npx http-server -p 8000
```

http://localhost:8000 にアクセス

## アーキテクチャ

### ファイル構成

- **トップレベルページ**: index.html, about.html, contact.html, categories.html, tags.html, 404.html
- **記事（共置き）**: `posts/YYYY-MM-DD-slug/index.html` と同ディレクトリの `images/` に記事専用画像を格納
  - 例: `posts/2025-11-12-first-camp/index.html`, `posts/2025-11-12-first-camp/images/cover.webp`
- **共通パーツ**: `includes/header.html`, `includes/footer.html`
  - すべてのページでプレースホルダ（`#header-placeholder`, `#footer-placeholder`）+ JS で読み込み
  - `<meta name="site-root" content="…">` を各ページの `<head>` に設け、`js/common.js` が参照
- **アセット**: CSS は `assets/css/`、共有画像は `assets/img/`（OGP用などの汎用のみ）
- **JavaScript**: `js/common.js`

### ヘッダー・フッターの更新方法

- 全ページに `<div id="header-placeholder"></div>` / `<div id="footer-placeholder"></div>` を設置し、`js/common.js` が `includes/*.html` を動的読込。`includes/` を更新すれば全ページへ一括反映される。
- ルート解決は `<meta name="site-root">` を使用（トップは空、記事は `../../`）。

相対パスはページ階層に応じて調整（トップレベル: `href="index.html"`、記事: `href="../../index.html"`）。

### CSSカスタムプロパティ

`assets/css/main.css` は `:root` で定義された変数を使用：

- **カラーパレット**: 「すみわたる」配色（澄んだブルー/ミント基調）
  - プライマリ: `--color-primary` (#2fa7c8)
  - その他: `--color-primary-light`, `--color-accent` など
- **スペーシング**: 8pxベースのシステム（`--spacing-xs` ～ `--spacing-3xl`）
- **アニメーション**: `prefers-reduced-motion` に対応

### JavaScript機能（js/common.js）

主要機能：

1. **ナビゲーションのアクティブ表示**: 現在ページのリンクに `.active` クラスを自動付与
2. **トップへ戻るボタン**: 400pxスクロール後に表示
3. **スクロールアニメーション**: IntersectionObserverでカードをreveal
4. **ヘッダー自動非表示**: 下スクロールで隠れ、上スクロールで表示
5. **スクロール進捗バー**: 画面上部に固定表示
6. **記事検索**: index.htmlでクライアントサイドフィルタリング
7. **目次自動生成**: 記事ページのH2見出しから生成
8. **パララックスヘッダー**: `.page-header` の背景が微妙に動く

全アニメーションは `prefers-reduced-motion: reduce` を尊重。

### SEO・メタタグ

各ページに以下を含む：
- Open Graphタグ
- Twitter Cardメタタグ
- カノニカルURL（GitHub Pagesドメイン）
- 日本語ロケール（`ja_JP`）
- og:image（1280x670）

## 記事追加の運用（AI担当）

- 新規記事の作成・画像配置・トップ/カテゴリ/タグの更新は、開発用AIが行います。
- 依頼時に提供いただきたい情報：タイトル、日付（YYYY-MM-DD）、カテゴリ、タグ（任意）、抜粋、カバー/本文画像、スラッグ（任意）。
- AIは `posts/YYYY-MM-DD-slug/` を作成し、`index.html` と `images/` をスキャフォールド、必要箇所を自動更新します。

### 記事カードの構造

```html
<article class="post-card">
  <a href="posts/YYYY-MM-DD-slug.html" class="post-card-image">
    <img src="assets/img/image.jpg" alt="説明" loading="lazy">
  </a>
  <div class="post-card-content">
    <h2 class="post-card-title">
      <a href="posts/YYYY-MM-DD-slug.html">タイトル</a>
    </h2>
    <p class="post-card-excerpt">抜粋文...</p>
    <div class="post-card-meta">
      <time datetime="YYYY-MM-DD">YYYY.MM.DD</time>
      <span class="meta-separator">|</span>
      <a href="categories.html#カテゴリ名" class="card-category">カテゴリ名</a>
    </div>
  </div>
</article>
```

### カテゴリ一覧

- 関東
- 関西
- ギア
- 料理
- ノウハウ

## 制約事項

- **ビルドプロセスなし**: 静的配信（GitHub Pages）。
- **純粋な静的サイト**: サーバーサイド処理・API呼び出しなし。
- **共通パーツは動的読込**: includes更新は全ページに即時反映。
- **相対パス**: `<meta name="site-root">` を併用して揺れを抑制。

## ブログ記事作成ガイドライン（重要）

新規記事は次の要件を満たしてください。これにより既存記事と同じCSS/JS挙動・見た目が適用されます。

- 置き場所: `posts/YYYY-MM-DD-slug/index.html`（共置き）、画像は同フォルダの `images/` 配下
- 必須メタ: `<meta name="site-root" content="../../">`
- CSSの読み込み（`<head>` 内・順序維持）:
  - `<link rel="stylesheet" href="../../assets/css/normalize.css">`
  - `<link rel="stylesheet" href="../../assets/css/main.css">`
- 共通ヘッダー/フッター（本文の前後に設置）:
  - `<div id="header-placeholder"></div>`
  - `<div id="footer-placeholder"></div>`
- 本文ラッパー: 記事本文は必ず `<article class="post-content"> ... </article>` 内に配置
- スクリプト（`</body>` 直前）: `<script src="../../js/common.js"></script>`（構造が `posts/.../index.html` のため `../../`）
- パンくず・見出し・メタ:
  - タイトル（`<title>` と本文の `<h1>`）を両方設定
  - `<meta name="description" content="...">` を記述
  - 任意でパンくず（既存記事に準拠）
- 目次（任意）: 目次を出したい場合は本文の前に以下を配置すると自動生成されます
  - `<nav class="table-of-contents"><h2>目次</h2><ul></ul></nav>`
- 画像・リンクの相対パス: 記事内画像は `./images/...`、サイト内リンクは `../../index.html` など `../../` を付与
- 追記作業（手動）: `index.html` の記事カード、`categories.html`（必要なら `tags.html`）を更新

### スターターテンプレート（抜粋）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>記事タイトル</title>
  <meta name="description" content="記事の要約">
  <meta name="site-root" content="../../">
  <link rel="stylesheet" href="../../assets/css/normalize.css">
  <link rel="stylesheet" href="../../assets/css/main.css">
</head>
<body>
  <div id="header-placeholder"></div>
  <main class="container">
    <nav class="breadcrumbs" aria-label="パンくずリスト">
      <ol>
        <li><a href="../../index.html">ホーム</a></li>
        <li>記事</li>
      </ol>
    </nav>

    <!-- 任意: 目次を表示したい場合 -->
    <!-- <nav class="table-of-contents"><h2>目次</h2><ul></ul></nav> -->

    <header class="post-header">
      <h1>記事タイトル</h1>
      <p class="post-meta">YYYY.MM.DD <span class="meta-separator">|</span> <a href="../../categories.html#カテゴリ" class="post-category">カテゴリ</a></p>
    </header>

    <article class="post-content">
      <p>本文...</p>
      <!-- 例: 記事用画像は共置き -->
      <!-- <img src="./images/cover-1200x670.webp" alt="説明"> -->
    </article>
  </main>
  <div id="footer-placeholder"></div>
  <script src="../../js/common.js"></script>
  </body>
</html>
```

## 運用ポリシー（柔軟な更新）

- 本リポジトリの開発支援AIは、開発者（ユーザー）の要望に応じて、本ファイル（CLAUDE.md）および `AGENTS.md` を柔軟に更新して構いません。
- 更新時は既存方針との整合性を保ち、最小差分で行い、関連ドキュメント間の重複・矛盾を解消してください。
- 仕様変更が記事テンプレートや運用手順に影響する場合は、該当セクション（記事ガイドライン、チェックリスト等）も合わせて改訂してください。
