# 基本設計書（機能別ドラフト）

## 1. ドキュメント概要
- **目的**: 再実装対象となる Clash Royale ダメージ計算ツールの主要機能ごとに UI・データ・振る舞いを整理し、チーム間で共通認識を持つ。
- **対象読者**: プロダクトオーナー、UI/UX デザイナー、フロントエンドエンジニア。
- **前提と制約**:
  - フロントエンドは React + TypeScript + Vite を用いた SPA とする。
  - UI ライブラリは Chakra UI を採用し、既存テーマ資産を活かす。
  - アプリはクライアントサイドのみで完結し、カードデータはローカル JSON（`src/assets/CardData.json`）を参照。
  - 利用ブラウザは最新版の Chromium 系 / Firefox / Safari を想定。

## 2. システム全体像
- 1 ページ構成で、防衛カード情報パネルと攻撃カード管理セクションを上下（モバイル時）または左右（デスクトップ時）に配置。
- `CardContext`（仮称）がカード辞書・選択状態・計算結果を保持し、各コンポーネントはカスタムフック経由で利用する。
- レイアウトは Chakra UI の `Flex` / `Stack` を用いレスポンシブに最適化する。
- 計算結果は防衛パネルに集約表示し、攻撃カード側ではカードごとの内訳を提示する。

## 3. データ定義と命名ルール
- **命名規則**: React State / Context で保持するプロパティは `camelCase`。JSON 由来のカード辞書は元データの `PascalCase` を維持する。
- **キー体系**: カードキーは JSON 内のキー（例: `"Archers"`）をそのまま利用し、`defenseCardKey` や `attackCards[index].cardKey` と紐付ける。
- **データモデル**:

| エンティティ | プロパティ | 型 | 説明 |
| --- | --- | --- | --- |
| `DefenseSelection` | `defenseCardKey` | `string` | 防衛に選択中のカードキー。必須。 |
| | `defenseCard` | `TroopCard` | カード辞書から取得した防衛カード詳細。 |
| `AttackCardEntry` | `cardKey` | `string \| null` | 選択されたカードキー。未選択の場合は `null`。 |
| | `type` | `'Troop' \| 'Spell' \| null` | カード種別。 |
| | `attackNumber` | `number` | 攻撃回数。0 以上 3 桁まで。 |
| `DamageSummary` | `perCard[index]` | `number` | 各攻撃行の総ダメージ値。 |
| | `total` | `number` | 被ダメージ合計。 |

- **辞書構造**: 元データは `Troops` と `Spells` の 2 辞書（`EnName`, `JpName`, `Icon`, `Damage`, `TowerDamage?`, `Hitpoints?`）。アプリ側では読み込み時に `key`, `enName`, `jpName`, `icon`, `damage`, `towerDamage`, `hitpoints`（Troop のみ）へ正規化する。

## 4. 共通 UI / UX ガイドライン
- **ヘッダー**: 固定表示。アプリ名と簡易説明（例: "Clash Royale Damage Simulator"）。
- **カラー / テーマ**: 背景は淡色、カードパネルは白系のカード UI、アクセントカラーにゲーム世界観を反映した青/オレンジを使用。
- **レスポンシブ**: ブレークポイント 480px, 768px, 1024px を目安にスタック方向を切り替える。ボタンや入力幅はモバイルでもタップしやすいサイズ（幅 44px 以上）。
- **アクセシビリティ**: モーダルはフォーカストラップを有効化。入力にはラベルを関連付け、キーボード操作を保証する。数値入力にはステップボタンと直接入力の双方を提供。

## 5. 機能別基本設計

### 5.1 防衛カード管理機能
- **目的**: 防衛対象となるユニットを 1 体選び、その HP と被ダメージ結果を可視化する。
- **関連画面 / コンポーネント**: `DefenceCardPanel`（仮）、`SelectDefenceOverlay` モーダル。
- **UI 構成**:
  - パネル上部にカード画像と名称を表示。
  - 中央に主要ステータス（HP、被ダメージ、残 HP）を `StatusIndicator` 形式で縦並びに配置。
  - 下部に「防衛カードを選択」ボタンを配置し、モーダル起動とする。
- **データ入出力**:
  | 種別 | 名称 | 型 | 入出力元 | 詳細 |
  | --- | --- | --- | --- | --- |
  | 入力 | `defenseCardKey` | `string` | `CardContext` | 選択中カードキー。 |
  | 入力 | `troops` | `Record<string, TroopCard>` | `CardContext` | カード辞書。 |
  | 入力 | `damageSummary.total` | `number` | `CardContext` | 被ダメージ合計。内部では `DamageCalculator` の結果を購読。 |
  | 出力 | `currentHitpoints` | `number` | UI | `defenseCard.hitpoints` を表示。 |
  | 出力 | `receivedDamage` | `number` | UI | `damageSummary.total` を表示。 |
  | 出力 | `remainingHitpoints` | `number` | UI | `max(0, defenseCard.hitpoints - damageSummary.total)` を表示。 |
  | 内部 | `isSelectModalOpen` | `boolean` | ローカルステート | モーダル開閉制御。 |
- **処理フロー**:
  1. 初期化時に `defenseCardKey` を既定値（`'Knight'` 等）で設定し、`troops` 辞書からカード詳細を取得して描画する。
  2. 被ダメージ合計は `DamageCalculator` が `CardContext` に反映し、本パネルは `useEffect`/`useMemo` で監視して再描画する。
  3. 「防衛カードを選択」押下で `isSelectModalOpen = true` とし、`SelectDefenceOverlay` を表示する。
  4. モーダルで新カードを選択 → `setDefenseCardKey(newKey)` → 閉じる → 再描画でステータス更新。
- **バリデーション / エラー**:
  - モーダルで不正キーが選択された場合は警告を表示し、前回値を保持。
  - 防衛カードが未選択の状態は許容しない（初期値必須）。
- **備考**: 今後の拡張で複数防衛シナリオを扱う場合はパネルをタブ化できるよう、ヘッダーとステータス表示をコンポーネント化しておく。

### 5.2 攻撃カードスロット管理機能
- **目的**: 複数の攻撃カードをリスト形式で追加・並べ、個別に編集できるようにする。
- **関連画面 / コンポーネント**: `AttackCardSection`, `AttackCardRow`, `AddAttackCardButton`。
- **UI 構成**:
  - セクションヘッダーに「攻撃カード」と現在のスロット数を表示。
  - 各行にはカード画像、名称、単発ダメージ、攻撃回数、総ダメージ、編集ボタンを横並びで配置。モバイルでは縦積みに切り替える。
  - 最下部に「カードを追加」ボタンを配置。
- **データ入出力**:
  | 種別 | 名称 | 型 | 入出力元 | 詳細 |
  | --- | --- | --- | --- | --- |
  | 入力 | `attackCards` | `Record<number, AttackCardEntry>` | `CardContext` | 行辞書。 |
  | 入力 | `attackOrder` | `number[]` | `CardContext` | 描画順序。未決定の場合はキー昇順。 |
  | 入力 | `troops` / `spells` | `Record<string, TroopCard>` / `Record<string, SpellCard>` | `CardContext` | カード辞書。 |
  | 出力 | `onEdit(index)` | `(index: number) => void` | 子コンポーネント | モーダル開閉用ハンドラ。 |
  | 出力 | `onAdd()` | `() => void` | `CardContext` | 新規行を生成。 |
  | 内部 | `isSelectModalOpen` | `boolean` | ローカルステート | 編集対象インデックスと共に保持。 |
- **処理フロー**:
  1. `CardProvider` 初期化時に `attackCards` に `{0: { cardKey: null, type: null, attackNumber: 1 }}` を投入し、`attackLastIndex = 0` とする。
  2. 「カードを追加」で `attackLastIndex += 1` → `attackCards[newIndex]` に空エントリを追加 → `attackOrder` に `newIndex` を push。
  3. 各行の編集ボタン押下で対象インデックスを記録し、`SelectAttackOverlay` を表示。
  4. 編集確定時に `updateAttackCard(index, payload)` を dispatch し、辞書と `damageSummary.perCard[index]` が更新される。
  5. 削除・並び替え追加時は `attackOrder` の配列操作で実現する。
- **バリデーション / エラー**:
  - 攻撃回数が負数のまま確定された場合は `attackNumber = 0` に正規化し、警告トーストを表示。0 の場合は合計 0 として扱う。
  - `cardKey` が `troops`/`spells` いずれにも存在しない場合、`error` 状態を付与し `damageSummary.perCard[index] = 0` とする。
- **備考**: 空行は視覚的に「カード未選択」とわかるプレースホルダー（アイコン＋テキスト）を表示する。

### 5.3 攻撃カード選択モーダル機能
- **目的**: 攻撃カード行に紐づくカード種別・カードキー・攻撃回数を編集する。
- **関連画面 / コンポーネント**: `SelectAttackOverlay`, `NumberInputWithButtons`。
- **UI 構成**:
  - モーダルヘッダーに対象行の識別子（例: "攻撃カード 1"）。
  - 本文に以下を縦配置: 「カード種別」セレクト、「カード」セレクト（種別に応じて候補切り替え）、攻撃回数入力（数値入力＋上下ボタン）。
  - フッターに「適用」「キャンセル」ボタン。
- **データ入出力**:
  | 種別 | 名称 | 型 | 入出力元 | 詳細 |
  | --- | --- | --- | --- | --- |
  | 入力 | `initialValue` | `AttackCardEntry` | 呼び出し元 | 編集対象のスナップショット。 |
  | 入力 | `troops` / `spells` | `Record<string, TroopCard>` / `Record<string, SpellCard>` | `CardContext` | セレクト候補。 |
  | 入力 | `isOpen` | `boolean` | 呼び出し元 | モーダル表示状態。 |
  | 入力 | `onClose` | `() => void` | 呼び出し元 | キャンセル/完了時に呼び出す。 |
  | 出力 | `onSubmit` | `(entry: AttackCardEntry) => void` | 呼び出し元 | バリデ通過後の値を返す。 |
  | 内部 | `localCardKey` | `string \| null` | ローカルステート | 入力値バッファ。 |
  | 内部 | `localType` | `'Troop' \| 'Spell' \| null` | ローカルステート | 選択中種別。種別切替で候補フィルタに利用。 |
  | 内部 | `localAttackNumber` | `number` | ローカルステート | 入力値バッファ。 |
- **処理フロー**:
  1. 親コンポーネントが `isOpen=true` と対象 `initialValue` を渡し、モーダル内部でローカルステートへコピーする。
  2. 種別を切り替えた際は `localCardKey = null` にリセットし、該当カテゴリーのリストに差し替える。
  3. 「適用」押下で `localType` と `localCardKey` が揃っているか検証し、攻撃回数は `0 <= n <= 100` の整数であることを確認する。
  4. バリデーションを通過したら `onSubmit({ cardKey: localCardKey, type: localType, attackNumber: normalizedAttackNumber })` を呼び出し、閉じる。
  5. キャンセルまたはモーダル外クリックは `onClose` のみ呼び出し、ローカルステートは破棄される。
- **バリデーション / エラー**:
  - 攻撃回数は `0〜100` の整数。範囲外はエラーメッセージを表示して確定を無効化。
  - カード未選択のまま「適用」を押した場合はエラー表示。
- **アクセシビリティ**: 初期フォーカスはカード種別セレクトに設定。`Esc` キーで閉じる。

### 5.4 ダメージ計算・結果表示機能
- **目的**: 各攻撃カードの総ダメージと全体被ダメージを算出し、防衛カードステータスを更新する。
- **関連コンポーネント**: `DamageCalculator`（ロジック層）、`DefenceCardPanel`, `AttackCardRow`。
- **計算仕様**:
  - **単発ダメージ**: Troop は `damage`、Spell は `towerDamage ?? damage` を採用。Spell のタワーダメージが 0 の場合は `damage` を利用。
  - **総ダメージ（攻撃カード単位）**: `singleDamage × attackNumber`。攻撃回数は 0 の場合 0。
  - **合計被ダメージ**: `Σ damageSummary.perCard[index]`。エラー行は 0。
  - **残り HP**: `max(0, defenseCard.hitpoints - damageSummary.total)`。
- **処理フロー**:
  1. `attackCards` または `defenseCardKey` が変化したタイミングで `DamageCalculator` を再評価し、`DamageSummary` を導出。
  2. `DamageSummary` は `CardContext` のステートに保存し、防衛パネル・攻撃カード行が `useDamageSummary()` で購読。
  3. 攻撃カード行は `damageSummary.perCard[index]` を参照して表示し、未定義の場合は 0 を表示。
  4. 防衛パネルは `damageSummary.total` を参照し、残 HP を算出。
  5. 追加の派生 UI（チャート等）は `DamageSummary` の拡張プロパティを利用する。
- **UI 表示**:
  - 攻撃行では総ダメージ値と単発ダメージ×攻撃回数の式をサブテキストで表示。
  - 防衛パネルでは被ダメージ合計と残り HP を強調表示。残 HP が 0 の場合は警告カラーに切り替え。
- **エラー処理**:
  - カードデータが辞書に存在しない場合は `console.warn` を出力し、計算値は 0。
  - 数値が `1_000_000` を超える場合は `1_000_000` でクリップし、UI に「上限値に到達」ラベルを表示。
  - 小数が入力された場合は `Math.floor` で整数化し、警告表示を行う。

## 6. データ構造と状態管理（要約）
- カード辞書は `Record<string, TroopCard>` および `Record<string, SpellCard>` の 2 系統に分割。
- 防衛カードキーは文字列（必須）。攻撃カードは `Record<number, AttackCardEntry>` として管理し、UI では配列に変換して描画。
- 計算結果は `DamageSummary` 型（例: `{ perCard: { [index: number]: number }, total: number }`）で扱うと再利用しやすい。
- 状態管理は Context + Reducer もしくは Zustand を検討。最小構成では Context + `useReducer` で `dispatch({ type: 'UPDATE_ATTACK_CARD', payload })` のような設計とし、アクションは `SET_DEFENSE_CARD`, `ADD_ATTACK_CARD`, `UPDATE_ATTACK_CARD`, `REMOVE_ATTACK_CARD`, `RECALCULATE_DAMAGE` を用意。

## 7. 非機能要求・品質基準
- パフォーマンス: 主要操作は 100ms 以内に UI が更新されることを目標とする。
- テスト: 攻撃カード追加・モーダル編集・ダメージ計算の 3 シナリオを UI テストケースとして用意。計算ロジックはユニットテスト化。
- コード規約: ESLint + Prettier を既存設定で継続。コンポーネントは Functional Component + Hooks ベースとする。
- 国際化: 文言は最終的に i18n 対応できるよう、文字列は専用ファイル経由で管理する想定。

## 8. 今後の検討事項
- 攻撃カード削除ボタンの UI / 操作フロー（行の削除方法、確認ダイアログの有無）。
- ダメージ計算の細分化（例: クリティカル、複数段攻撃など特殊カード対応）。
- 防衛カードを複数登録して比較するモードの要否。
- カードデータの自動更新（API 連携）とキャッシュ戦略。

---
本書は機能別のドラフトであり、レビュー結果に応じて UI ワイヤーフレームやテーブル定義などを追記する。
