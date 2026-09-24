# お湯キャン△

キャンプと温泉、気ままな週末旅を綴る静的HTMLブログです。

公開サイト: https://inoshishi760en-beep.github.io/TabiCamp/

## 構成

- トップ・一覧・案内ページ: ルートのHTML
- 記事: `posts/YYYY-MM-DD-slug/index.html`
- 記事専用画像: 各記事の `images/`
- 共通デザイン: `assets/css/main.css`
- 共通動作: `js/common.js`
- ヘッダー・フッター: `includes/`

ビルドや外部フォントの読み込みは不要です。HTML・CSS・JavaScriptだけで動作します。

## ローカルプレビュー

Pythonが利用できる環境では、リポジトリ直下で実行してください。

```sh
python -m http.server 8000
```

http://localhost:8000/ を開きます。共通パーツをfetchで読み込むため、ファイルを直接開かずHTTPサーバーで確認してください。

## 公開

既存のGitHub Pagesが `main` ブランチのルートを公開します。変更を `main` にpushし、GitHub Actionsの「pages build and deployment」が成功した後に公開サイトを確認します。

CSS・JavaScript・共通パーツの変更時は、HTML内の `?v=20260924` と `js/common.js` の共通パーツ取得用バージョンを更新してキャッシュを切り替えます。

`404.html` のbase URLは本番の `/TabiCamp/` です。公開パスを変更するときは併せて更新してください。

## 記事の追加

詳細は [AGENTS.md](./AGENTS.md) を参照してください。

1. 記事HTMLと専用画像を作成し、カテゴリ・タグを決定します。
2. `categories.html` と `tags.html` の記事一覧・件数を更新します。
3. トップの最新記事（6件）とカテゴリ・人気タグのダイジェストを更新します。
4. 記事カードには原則 `card-720x450.webp` を使い、画像のalt・width・heightを記載します。
5. PC・スマートフォンで表示、内部リンク、共通ナビゲーションを確認します。

## お問い合わせ

現在は「お問い合わせ窓口は準備中」と表示しています。受付開始時に `contact.html`、`about.html`、`privacy.html` の案内を更新してください。
