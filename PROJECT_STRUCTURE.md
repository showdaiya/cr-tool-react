# プロジェクト構造

このドキュメントは、`cr-tool-react` リポジトリのディレクトリおよび主要ファイルの構成をまとめたものです。

## ルートディレクトリ

- `index.html` – Vite で使用されるエントリ HTML。
- `package.json` / `package-lock.json` – 依存関係と npm スクリプトの定義。
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` – TypeScript 設定。
- `eslint.config.js` – ESLint のルール設定。
- `vite.config.ts` – Vite のビルド設定。
- `public/` – ビルド時にそのまま公開される静的ファイル群。
- `src/` – アプリケーション本体のソースコード。

## public/

静的リソースを格納するディレクトリ。

- `resized_cards/` – Clash Royale のカード画像 (png) を大量に配置。
- `vite.svg` – Vite ロゴ。
- `ナイト.png` – Knight カードのサンプル画像。

## src/

React/TypeScript によるアプリケーションコード。

### エントリとスタイル

- `main.tsx` – `createRoot` を呼び出し、`App` コンポーネントを描画。
- `App.tsx` – Chakra UI と `CardProvider` を組み合わせ、ヘッダーと `CardBattle` ページを表示。
- `index.css` / `App.css` – グローバルスタイル。

### assets/

- `CardData.json` – 部隊カードや呪文カードのステータスデータを格納。

### components/

UI コンポーネント群。

- `Header.tsx` – 固定ヘッダー。「Clash Royale ダメージ計算」のタイトルを表示。
- `AttackCardSection.tsx` – 攻撃カードの一覧と追加ボタンを管理するセクション。
- `AttackCard.tsx` – 個々の攻撃カード。選択ダイアログ (`SelectAttackOverlay`) を開き、ダメージ情報を表示。
- `DefenceCard.tsx` – 防衛側カード。攻撃側から受ける総ダメージを計算し表示。
- `SelectAttackOverlay.tsx` – 攻撃カードを選択するモーダル。カード種別や攻撃回数を入力可能。
- `SelectDefenceOverlay.tsx` – 防衛カードを選択するモーダル。
- `StatusIndicator.tsx` – ラベル付きのステータス表示用コンポーネント。
- `common/GradientButton.tsx` – グラデーション付きボタンの共通コンポーネント。

### contexts/

- `CardContext.tsx` – カードデータと攻撃/防衛の状態を管理する React Context。`useTroops`・`useSpells` などのカスタムフックを提供。

### pages/

- `CardBattlePage.tsx` – 防衛カードと攻撃カードセクションを組み合わせたメインページ。

### theme/

- `chakraTheme.ts` – Chakra UI のテーマ拡張。ボタンのフォーカススタイルなどを定義。

### types/

- `types.ts` – カードデータ (`TroopCard`, `SpellCard`, `AttackCardType` 等) の TypeScript 型定義。

### その他

- `vite-env.d.ts` – Vite 用の型定義補助ファイル。

## npm スクリプト

`package.json` で定義されている主要スクリプト:

- `npm run dev` – 開発サーバを起動。
- `npm run build` – 型チェック後に本番ビルドを実行。
- `npm run lint` – ESLint による静的解析。
- `npm run preview` – ビルド成果物のプレビュー。
- `npm run format` – Prettier によるソースフォーマット。

