<!-- freshcart/docs/10_engineering/TRANSACTIONS_CONSISTENCY.md -->
# トランザクションと整合性

## 1. 境界設計
- T1（DB内整合）: 在庫引当・注文仮作成・スロット検証（短時間、`READ COMMITTED`）
- 外部I/O: PSP呼出（トランザクション外）
- T2（確定/戻し）: 決済結果で注文確定/取消、在庫戻し、スロット消費

## 2. ロック方針
- 在庫: `SELECT ... FOR UPDATE`（SKU単位）
- スロット: `FOR UPDATE SKIP LOCKED` で取り合いを回避
- 予約行: `slot_reservations` は cart_id + status=held を一意に
- 長時間ロック禁止。外部I/Oはトランザクション外

## 3. デッドロック回避
- ロック順序を**SKU ID昇順**に統一
- 部分更新に限定してロック粒度を小さく
- タイムアウトを設置（例: `lock_timeout=1s`）→再試行

## 4. 整合性ルール
- 在庫不足時は即T1ロールバック → HTTP 409 `INV_SHORTAGE`
- 決済失敗時はT2で**在庫を戻す**、スロットは`active`へ戻す
- 3DS保留は `auth_pending` とし、30分タイマーで自動キャンセル

## 5. 一意制約と冪等
- `idempotency_keys(key)` UNIQUE
- `slot_reservations(cart_id, status='held')` に部分一意索引
- 二重予約/二重課金は**DB制約＋アプリ冪等**の二重防御

## 6. 例外テーブル
| 例外 | 原因 | 対応 |
|---|---|---|
| AMOUNT_MISMATCH | リクエスト合計と再計算差>1円 | 422返却、監査ログ出力 |
| SLOT_EXPIRED | TTL超過 | 409返却、再予約を促す |
| PSP_TIMEOUT | 外部遅延 | 504返却、再試行ジョブへ |
