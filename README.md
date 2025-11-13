# Camp Site

キャンプ場レビューとアウトドア情報を発信する静的HTMLブログ

## 特徴

- **ビルド不要**: 純粋なHTML/CSS/JavaScriptのみで構築
- **記事画像の共置**: 各記事ディレクトリに画像を配置し管理が容易
- **動的ヘッダー/フッター**: JavaScript で共通パーツを読み込み、一括管理
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **SEO対応**: Open Graph・Twitter Card対応、適切なメタタグ設定

## ファイル構成

```
/
├── index.html           # トップページ
├── about.html          # Aboutページ
├── contact.html        # お問い合わせ
├── categories.html     # カテゴリ一覧
├── tags.html          # タグ一覧
├── 404.html            # エラーページ
├── privacy.html        # プライバシーポリシー
├── assets/
│   ├── css/
│   │   ├── normalize.css  # 最適化済みリセットCSS
│   │   └── main.css       # メインスタイル（カスタムプロパティ使用）
│   └── img/
│       └── rectangle-banner-1280x670.webp  # OGP用画像
├── includes/           # 共通HTML部品（JS動的読込）
│   ├── header.html
│   └── footer.html
├── js/
│   └── common.js      # 共通機能（ヘッダー/フッター読込、アニメーション等）
└── posts/              # 記事（共置きパターン）
    └── YYYY-MM-DD-slug/
        ├── index.html  # 記事本体
        └── images/     # 記事専用画像（カード用・本文用）
```

## ローカル開発

HTTPサーバーを起動してブラウザで確認：

```bash
# Python 3
python3 -m http.server 8000

# または Node.js (http-server)
npx http-server -p 8000
```

http://localhost:8000 にアクセス

## GitHub Pagesで公開

1. GitHubにプッシュ
2. Settings → Pages
3. Source: `main` ブランチ、`/ (root)` を選択

サイトURL: https://yamazaki2357.github.io/camp-site/

## 記事の追加方法

1. **記事ディレクトリを作成**: `posts/YYYY-MM-DD-slug/` を作成
2. **記事HTMLを作成**: `posts/YYYY-MM-DD-slug/index.html` を配置（既存記事を参考に）
3. **画像を配置**: 同フォルダに `images/` を作成し、記事画像を格納
4. **トップページに追加**: `index.html` の `.posts-grid` に記事カードを追加
5. **カテゴリページを更新**: `categories.html` の該当カテゴリセクションに記事リンクを追加
6. **（任意）タグページを更新**: `tags.html` のタグクラウドと記事一覧を更新

詳細は [CLAUDE.md](./CLAUDE.md) の「ブログ記事作成ガイドライン」を参照。

## ライセンス

MIT License
