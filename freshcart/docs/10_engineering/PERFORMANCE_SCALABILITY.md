<!-- freshcart/docs/10_engineering/PERFORMANCE_SCALABILITY.md -->
# 性能・スケーラビリティ

## 1. SLO/指標
- `/checkout/confirm`: p95 ≤ 700ms, エラー率 ≤ 0.1%/日
- `slots/reserve`: p95 ≤ 400ms

## 2. キャッシュ
| 対象 | 種別 | TTL | 失効 |
|---|---|---|---|
| 商品マスタ | 分散キャッシュ | 10m | 更新イベントで無効化 |
| クーポンルール | 分散キャッシュ | 5m | 管理画面更新時にフラッシュ |

## 3. インデックス設計（例）
```sql
-- 注文検索（ユーザー毎・新着）
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);

-- 予約の期限監視
CREATE INDEX idx_resv_status_ttl ON slot_reservations(status, ttl_at);

-- 在庫検索（SKU単位での更新頻度が高い）
-- PK(sku_id)前提、更新時はカバリング列のみ
```

4. スケール
•水平スケール前提。ステートレスAPI、セッションはトークン化
•キュー（非同期）: 決済再試行・保留タイマー・メール通知はジョブキューへ
•バルク操作はバッチに分離（深夜）

5. N+1封じ
•集約リポジトリはJOIN or IN句で一括取得
•order -> items は1回のクエリにまとめる

---
