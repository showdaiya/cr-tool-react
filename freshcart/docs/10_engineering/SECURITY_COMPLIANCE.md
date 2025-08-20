<!-- freshcart/docs/10_engineering/SECURITY_COMPLIANCE.md -->
# セキュリティ・コンプライアンス

## 1. 支払い情報
- カード情報は自システムで保持しない（トークン化のみ）
- ペイメントはPSPのセキュアUI/SDKを使用
- ログにPAN/CVC/氏名/住所を出力禁止（マスキング）

## 2. 通信・ヘッダ
- TLS1.2+、HSTS、TLS圧縮無効
- セキュリティヘッダ: `Content-Security-Policy`, `X-Frame-Options=DENY`, `X-Content-Type-Options=nosniff`, `Referrer-Policy`

## 3. アプリ対策
- CSRF: SameSite=Lax or Strict + CSRFトークン
- XSS: テンプレートはエスケープ既定ON、CSPでスクリプト制限
- 速度制限/レート制限: クーポン発行APIはIP+ユーザーでレート制限

## 4. 権限
- 役割: guest/member/admin。エンドポイント毎にポリシー表
- 監査ログ: 誰が何をいつ実行したか（`LOGGING.md`参照）
