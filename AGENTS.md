# Repository Guidelines

## プロジェクト構成
- ルート直下にページ: `index.html`, `about.html`, `categories.html`。
- 記事（共置き）: `posts/YYYY-MM-DD-slug/index.html` と `images/`（記事専用画像）
- アセット: `assets/css/*.css`, `assets/img/*`（共有/OGP用のみ）
- スクリプト: `js/common.js`、共通断片は `includes/` に配置

## 開発
- ローカルプレビュー: `python3 -m http.server 8000` を実行し、`http://localhost:8000/` を開く。

## コーディング規約
- インデント2スペース / UTF-8。
- HTML: 属性はダブルクォート、意味のある `alt` を必ず付与。
- CSS: `assets/css/main.css` を編集。既存のCSS変数・クラス（例: `post-card`, `site-header`）を再利用。
- JS: ES6+ を前提にし、`js/common.js` に集約。

## 命名
- ファイル: kebab-case。
- 記事ディレクトリ: `YYYY-MM-DD-slug/`（中に `index.html`）
- 画像: 用途・サイズを含める（例: `cover-1200x670.webp`）

## コミット/PR
- コミット: Conventional Commits（`feat:`, `fix:`, `chore:` など）。小さく要点を明確に。
- PR: 変更概要と主要ファイルを記載。見た目変更はスクリーンショットを添付。

## ブログ記事作成ガイドライン（必読）

新規記事は以下を厳守してください。既存記事と同一のCSS/JS・挙動を担保します。

- 置き場所: `posts/YYYY-MM-DD-slug/index.html` と `images/`（共置き）
- CSS読み込み（`<head>` 内）:
  - `../../assets/css/normalize.css`
  - `../../assets/css/main.css`
- 共通パーツの読み込み（本文の前後）:
  - `<div id="header-placeholder"></div>`
  - `<div id="footer-placeholder"></div>`
- 本文ラッパー: `<article class="post-content"> ... </article>` を必須
- スクリプト読込（末尾）: `../../js/common.js`
- 目次（任意）: 目次を出す場合は `<nav class="table-of-contents"><h2>目次</h2><ul></ul></nav>` を本文前に配置
- 相対パス規約: 記事内画像は `./images/...`、サイト内リンクは `../../index.html` など `../../` を付与
- 追加の手動反映: `index.html` の記事カード、`categories.html`（必要に応じて `tags.html`）を更新

チェックリスト（作成時に自己確認）
- [ ] `posts/YYYY-MM-DD-slug/` を作成し、その下に `index.html`
- [ ] 同フォルダに `images/` を作成し、本文・カード画像を配置
- [ ] CSS2本（normalize.css, main.css）を `../../` で読み込み
- [ ] ヘッダー/フッターのプレースホルダを設置
- [ ] 本文が `.post-content` に入っている
- [ ] 末尾で `../../js/common.js` を読み込み
- [ ] 画像・リンクの相対パス（`./images/...`, `../../index.html`）が正しい
- [ ] `index.html` のカード、`categories.html`（必要なら `tags.html`）を更新

## 運用ポリシー（柔軟な更新）

- 本リポジトリの開発支援AIは、ユーザーの要望に応じて、本ファイル（AGENTS.md）および `CLAUDE.md` の内容を柔軟に修正・更新して構いません。
- 変更は最小限の差分で行い、既存の記述と矛盾しないよう整合性を確保してください。
- 仕様変更に伴い記事テンプレートやチェックリストが影響を受ける場合、関連セクションを同時に更新して最新状態を保ってください。
