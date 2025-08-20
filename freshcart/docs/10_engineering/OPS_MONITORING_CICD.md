<!-- freshcart/docs/10_engineering/OPS_MONITORING_CICD.md -->
# 運用・監視・CI/CD

## 1. 可観測性
- ログ: `trace_id`, `actor`, `action`, `resource`, `decision`, `error_code`, `latency_ms`
- メトリクス: p50/p95/p99、エラー率、外部I/O遅延、在庫引当失敗率
- トレース: confirmのT1/T2/PSPをスパンで分割

## 2. 監視ルール例
| 指標 | しきい値 | アクション |
|---|---|---|
| confirm p95 | > 900ms 5分継続 | 警告、スローダンプ取得 |
| PSPタイムアウト率 | > 2% 5分 | 警告、リトライ間隔見直し |
| 5xx率 | > 0.5% 1分 | 重大、ロールバック検討 |

## 3. デプロイ
- CI: lint → unit → contract → it/e2e → セキュリティスキャン
- CD: カナリア or ブルーグリーン、**ロールバックは1コマンド**で即時
- DBマイグレーション: **前方互換**の順序（expand→migrate data→contract）
