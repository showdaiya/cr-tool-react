<!-- freshcart/docs/10_engineering/INTEGRATIONS.md -->
# 外部サービス連携ガイド（決済・外部API）

## 1. 接続方針
- 通信: HTTPS/TLS1.2+、SNI必須、サーバ証明書はOS信頼ストアで検証
- タイムアウト: connect=2s, read=3s（合計≤5s）
- リトライ: 冪等な操作のみ（GET/PUT系 or 冪等キー付きPOST）。指数バックオフ＋ジッタ
- 監査: すべての外部呼び出しに `trace_id` を付与、結果と遅延をメトリクス送信

## 2. エラーハンドリング分類
| 区分 | 例 | リトライ | 返却HTTP | 備考 |
|---|---|---|---:|---|
| 一時的 | 5xx, ネットワーク断, タイムアウト | ○ | 504 | 最大2回まで、ジッタ付与 |
| 恒久的 | 4xx（認証/仕様違反） | × | 400/401/403 | 設定ミス・仕様変更 |
| ビジネス | 残高不足、限度超過 | × | 402 | ユーザー起因 |
| 不明 | 不正フォーマット | × | 502 | 監視アラート対象 |

## 3. リトライ戦略（擬似コード）
```pseudo
max_attempts = 3
base = 250ms
for i in 0..max_attempts-1:
  try:
    res = call_psp(timeout=3s, idempotency_key=IK)
    return res
  except e if transient(e):
    sleep(random(0,1)*base*2^i)   # ジッタ
continue -> raise PSP_TIMEOUT
```

4. 冪等の徹底
•書き込み系POSTは必ず Idempotency-Key を要求し、idempotency_keys にリクエストハッシュと最終応答を保存
•PSP側にも冪等ヘッダ/キーがあれば付与（なければ内部で重複排除）
•結果再送はステータス/本文/重要ヘッダを完全一致で返却

5. 仕様変更への追随
•PSP/OpenAPIのスキーマを契約テスト（consumer-driven）で毎日CI実行
•破壊的変更が検出されたら ERROR: CONTRACT_BREAK をCIでfail
•バージョン切替はフェーズドリリース（feature flag）で並走

6. ログとマスキング
•リクエスト/レスポンス本文は機微項目を必ず伏せ字（PAN, CVC, 住所など）
•ログ例: trace=... action=psp:charge ms=384 result=ok masked_fields=[pan,cvc]

---
