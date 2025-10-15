# 詳細設計書（第1版）

## 1. システム構成
- クライアントサイド SPA（Single Page Application）。
- React + TypeScript + Vite 構成を前提。
- Chakra UI を UI コンポーネントライブラリとして採用。
- データソースはローカル JSON（`src/assets/CardData.json`）。アプリ起動時に読み込み、Context 内で正規化する。

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
  - 依存: `CardContext`（`useTroops`, `useDefenseCardKey`, `useDamageSummary`）。
  - 内部処理:
  1. 防衛カードキーからカードデータを取得。
  2. `damageSummary.total` を参照し、被ダメージと残 HP を計算。
  3. HP/被ダメージ/残 HP を表示。
  4. 「選択」ボタンで `SelectDefenceOverlay` を開く。
  - 出力: なし（表示のみ）。

### 3.5 `AttackCardSection`
- 役割: 攻撃カード一覧の管理と追加操作。
- 依存: `CardContext`（`useAttackCards`, `useAttackOrder`, `useAttackLastIndex`）。
- 内部処理:
  1. 追加ボタン押下で `attackLastIndex` をインクリメント、空の攻撃カードエントリを追加。
  2. 子コンポーネントとして `AttackCard` をレンダリング。
- 拡張予定: 削除ボタン、並び替え UI。

### 3.6 `AttackCard`
  - 役割: 個々の攻撃カード行を表示し、モーダルを開く。
  - 依存: `CardContext`（`useAttackCards`, `useDamageSummary`, `useTroops`, `useSpells`）。
  - 内部処理:
  1. 該当インデックスのカード情報を取得。
  2. カード未選択の場合は「選択」ボタンを表示。
  3. 選択済みの場合はカード画像と `damageSummary.perCard[index]` を表示し、「編集」ボタンでモーダルを開く。
  4. モーダルは `SelectAttackOverlay` を利用。

### 3.7 `SelectDefenceOverlay`
- 役割: 防衛カード選択モーダル。
- UI: Chakra `Modal` + `Select`。
- 動作: 選択変更時に `setDefenseCardKey` を即時更新。閉じるボタンでモーダル終了。

### 3.8 `SelectAttackOverlay`
- 役割: 攻撃カード選択モーダル。
- UI: Chakra `Modal` + `Select` + 攻撃回数入力（数値入力 + 増減ボタン）。
- 内部状態:
  - `localCardKey`: 選択中カードキー。
  - `localType`: `'Troop' | 'Spell'`。
  - `localAttackNumber`: 攻撃回数。上下ボタンで ±1、直接入力可。
- 確定処理: バリデーション通過後に `updateAttackCard(attackCardIndex, entry)` を dispatch。
- バリデーション: 攻撃回数は `0〜100` の整数。種別とカードキーが揃っている必要がある。

### 3.9 `StatusIndicator`
- 役割: 「ラベル: 値」表示の行コンポーネント。
- Props: `label`, `value`, `color`, `textColor`。
- UI: Chakra `Flex` + `Circle` + `Text`。

### 3.10 `GradientButton`
- 役割: グラデーション背景の共通ボタン。
- Props: Chakra `Button` の全 Props + `topColor`, `bottomColor`。
- UI: Chakra `Button` に背景グラデーションを適用。

## 4. 状態遷移・データフロー
1. アプリ起動時、`CardProvider` が `CardData.json` からカード辞書をロードし、`normalizeCardData(json)` で `Record<string, TroopCard>` / `Record<string, SpellCard>` に整形。
2. 初期ステートは `defenseCardKey = 'Knight'`, `attackCards = {0: { cardKey: null, type: null, attackNumber: 1 }}`, `attackOrder = [0]`, `attackLastIndex = 0`, `damageSummary = { perCard: {0: 0}, total: 0 }`。
3. ユーザーが攻撃カード追加ボタンを押すと、`attackLastIndex += 1` → `attackCards[newIndex] = { cardKey: null, type: null, attackNumber: 1 }` → `attackOrder.push(newIndex)`。
4. 攻撃カードモーダルで入力後、`updateAttackCard(index, entry)` を dispatch。リデューサーが `attackCards[index]` を更新し、`recalculateDamage()` をトリガーする。
5. 防衛カードモーダルでカード選択すると `setDefenseCardKey(newKey)` を dispatch。必要に応じて `recalculateDamage()` を再実行。
6. `DamageCalculator` が `attackCards` と `defenseCardKey` を基に `damageSummary` を更新。`DefenceCard` と `AttackCard` がフックを介して購読し、UI を再描画する。

## 5. 型設計
```ts
// JSON 由来のカードデータ（PascalCase）
interface RawTroopCard {
  EnName: string;
  JpName: string;
  Hitpoints: number;
  Damage: number;
  Type: 'Troop';
  Icon: string;
}

interface RawSpellCard {
  EnName: string;
  JpName: string;
  Damage: number;
  TowerDamage: number;
  Type: 'Spell';
  Icon: string;
}

// 正規化後に UI から利用する型（camelCase）
interface TroopCard {
  key: string;
  enName: string;
  jpName: string;
  hitpoints: number;
  damage: number;
  icon: string;
}

interface SpellCard {
  key: string;
  enName: string;
  jpName: string;
  damage: number;
  towerDamage: number;
  icon: string;
}

interface AttackCardEntry {
  cardKey: string | null;
  type: 'Troop' | 'Spell' | null;
  attackNumber: number; // >= 0
}

interface DamageSummary {
  perCard: Record<number, number>;
  total: number;
}

interface CardState {
  defenseCardKey: string;
  attackCards: Record<number, AttackCardEntry>;
  attackOrder: number[];
  attackLastIndex: number;
  damageSummary: DamageSummary;
  troops: Record<string, TroopCard>;
  spells: Record<string, SpellCard>;
}
```

## 6. 計算ロジック
- **単発ダメージ**: Troop は `troop.damage`、Spell は `spell.towerDamage ?? spell.damage`。
- **総ダメージ**: `singleDamage × attackNumber`（`attackNumber` は `Math.max(0, Math.floor(value))` で正規化）。
- **被ダメージ合計**: `Object.values(perCard).reduce((sum, value) => sum + value, 0)`。
- **残り HP**: `Math.max(0, defenseCard.hitpoints - totalDamage)` を推奨。
- エラーハンドリング: `type` が不明、または `cardKey` が辞書に存在しない場合は 0 を返し、`console.warn` を出力。

## 7. UI インタラクション詳細
- モーダルのフォーカストラップを有効にし、Tab 移動可能とする。
- 数値入力は直接編集とボタンの両対応。上下ボタンで 1 ずつ変化し、連続長押しで連続変更を許可。
- モーダル外クリックまたは閉じるボタンで閉鎖し、未保存の変更は破棄。
- 未選択状態ではダミー画像/テキストを表示するか「選択」ボタンのみ表示。
- 数値入力で小数を入力した場合は即時に整数へ丸めた値を表示し、トーストで通知。

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
