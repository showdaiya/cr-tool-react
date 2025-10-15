# 詳細設計書（第1版）

## 1. システム構成
- クライアントサイド SPA（Single Page Application）。
- React + TypeScript + Vite 構成を前提。
- Chakra UI を UI コンポーネントライブラリとして採用。
- データソースはローカル JSON（`src/assets/CardData.json`）。

## 2. ディレクトリ構成（予定）
```
src/
  assets/            # カードデータ、画像など静的アセット
  components/        # UI コンポーネント
    common/          # 汎用コンポーネント（ボタンなど）
  contexts/          # React Context（グローバルステート）
  hooks/             # カスタムフック（将来拡張）
  pages/             # ページコンポーネント
  theme/             # Chakra UI テーマ
  types/             # 型定義
```

## 3. 主要ページ/コンポーネント設計
### 3.1 `App`
- 役割: グローバルプロバイダー（ChakraProvider, CardProvider）で子コンポーネントをラップ。
- レイアウト: 全画面幅/高さを占有する Flex コンテナ。ヘッダー + コンテンツ。
- 入出力: なし。

### 3.2 `Header`
- 役割: 固定ヘッダーでアプリタイトルを表示。
- Props: なし。
- UI: Chakra `Box` + `Heading`。固定配置。

### 3.3 `CardBattlePage`
- 役割: メインページ。防衛カードパネルと攻撃カードセクションを配置。
- 内部構成: `DefenceCard`, `AttackCardSection`。
- レイアウト: Chakra `VStack` + `Stack` でレスポンシブ対応。

### 3.4 `DefenceCard`
- 役割: 防衛側カードの状態を表示し、選択モーダルを開く。
- 依存: `CardContext`（`useTroops`, `useDefenseCard`, `useAttackCards`）。
- 内部処理:
  1. 防衛カードキーからカードデータを取得。
  2. 攻撃カード一覧から総ダメージを算出。
  3. HP/被ダメージ/残 HP を表示。
  4. 「選択」ボタンで `SelectDefenceOverlay` を開く。
- 出力: なし（表示のみ）。

### 3.5 `AttackCardSection`
- 役割: 攻撃カード一覧の管理と追加操作。
- 依存: `CardContext`（`useAttackCards`, `useAttackLastIndex`）。
- 内部処理:
  1. 追加ボタン押下で `attackLastIndex` をインクリメント、空の攻撃カードエントリを追加。
  2. 子コンポーネントとして `AttackCard` をレンダリング。
- 拡張予定: 削除ボタン、並び替え UI。

### 3.6 `AttackCard`
- 役割: 個々の攻撃カード行を表示し、モーダルを開く。
- 依存: `CardContext`（`useAttackCards`, `useTroops`, `useSpells`）。
- 内部処理:
  1. 該当インデックスのカード情報を取得。
  2. カード未選択の場合は「選択」ボタンを表示。
  3. 選択済みの場合はカード画像とステータスを表示し、「編集」ボタンでモーダルを開く。
  4. モーダルは `SelectAttackOverlay` を利用。

### 3.7 `SelectDefenceOverlay`
- 役割: 防衛カード選択モーダル。
- UI: Chakra `Modal` + `Select`。
- 動作: 選択変更時に `setDefenseCard` を即時更新。閉じるボタンでモーダル終了。

### 3.8 `SelectAttackOverlay`
- 役割: 攻撃カード選択モーダル。
- UI: Chakra `Modal` + `Select` + 攻撃回数入力（数値入力 + 増減ボタン）。
- 内部状態:
  - `inputCardKey`: 選択中カードキー。
  - `inputType`: `Troop` or `Spell`。
  - `inputAttackNum`: 攻撃回数。上下ボタンで ±1、直接入力可。
- 確定処理: モーダル閉鎖時に `attackCards[attackCardIndex]` を更新。
- バリデーション: 攻撃回数は `0〜100` の範囲に制限（再構築時に要調整）。

### 3.9 `StatusIndicator`
- 役割: 「ラベル: 値」表示の行コンポーネント。
- Props: `label`, `value`, `color`, `textColor`。
- UI: Chakra `Flex` + `Circle` + `Text`。

### 3.10 `GradientButton`
- 役割: グラデーション背景の共通ボタン。
- Props: Chakra `Button` の全 Props + `topColor`, `bottomColor`。
- UI: Chakra `Button` に背景グラデーションを適用。

## 4. 状態遷移・データフロー
1. アプリ起動時、`CardProvider` が `CardData.json` からカード辞書をメモリロード。
2. `attackCards` は空オブジェクト、`attackLastIndex = -1`、`defenseCard = 'Knight'` で初期化。
3. ユーザーが攻撃カード追加ボタンを押すと、`attackLastIndex` が +1 され、`attackCards[newIndex]` に `{CardKey: null, AttackNumber: 1, Type: null}` を設定。
4. 攻撃カードモーダルでカード選択・回数入力後、閉じる際に `attackCards[index]` が更新され、React の再レンダリングで表示が変わる。
5. 防衛カードモーダルでカード選択すると `defenseCard` が更新され、`DefenceCard` の表示が再計算される。
6. `DefenceCard` コンポーネント内で `attackCards` を reduce し被ダメージを算出。残 HP を導出して表示。

## 5. 型設計
```ts
// Troop カード
interface TroopCard {
  EnName: string;
  JpName: string;
  Type: 'Troop';
  Icon: string;
  Hitpoints: number;
  Damage: number;
}

// Spell カード
interface SpellCard {
  EnName: string;
  JpName: string;
  Type: 'Spell';
  Icon: string;
  Damage: number;
  TowerDamage: number;
}

// 攻撃カードエントリ
interface AttackCardEntry {
  CardKey: string | null;
  Type: 'Troop' | 'Spell' | null;
  AttackNumber: number; // >= 0
}
```

## 6. 計算ロジック
- **単発ダメージ**: `card.Damage`。
- **総ダメージ**: `Damage × AttackNumber`。
- **被ダメージ合計**: すべての攻撃カードの総ダメージを合算。`AttackNumber = 0` の場合は 0。
- **残り HP**: `max(0, Hitpoints - TotalDamage)` を推奨。
- エラーハンドリング: `Type` が不明な場合はログ出力し、計算結果を 0 とする。

## 7. UI インタラクション詳細
- モーダルのフォーカストラップを有効にし、Tab 移動可能とする。
- 数値入力は直接編集とボタンの両対応。上下ボタンで 1 ずつ変化。
- モーダル外クリックまたは閉じるボタンで閉鎖。
- 未選択状態ではダミー画像/テキストを表示するか「選択」ボタンのみ表示。

## 8. バリデーション / エラー処理
- 攻撃回数: 0〜100 の整数。負数入力時は 0、100 超過は 100 に丸め。
- 防衛カード: Troops のキーのいずれかである必要。
- 選択モーダルで無効なカードが選択された場合はエラーを表示（将来対応）。

## 9. 将来拡張のフックポイント
- Context API を Redux Toolkit, Zustand 等へ差し替え可能なようにカスタムフックを経由。
- カードデータを API 化する場合、`CardProvider` 内でフェッチ処理を実装。
- 複数バトルシナリオ保存機能: `attackCards` を配列化し、ローカルストレージや IndexedDB と連携。

## 10. 未決定事項
- 攻撃カードの削除 UI（ボタン配置・挙動）。
- 攻撃カードが 0 件のときのガイド表示。
- モバイル向けの詳細 UI 微調整（セレクト幅の最適化など）。
- テスト範囲と優先度（ユニット vs E2E）。

---
本詳細設計書はドラフトです。レビュー結果を踏まえ、API インタフェースやテストケース、スタイルガイド等を追記予定です。
