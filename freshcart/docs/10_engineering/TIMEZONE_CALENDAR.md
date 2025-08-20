<!-- freshcart/docs/10_engineering/TIMEZONE_CALENDAR.md -->
# 時刻・タイムゾーン

## 1. 基本方針
- DB格納は**UTC**、表示はユーザーのIANA TZ
- スロットは `[start_at, end_at)` 半開区間
- DST跨ぎは `ZonedDateTime` で演算、日付のみ比較禁止

## 2. 期限計算
- TTL = 作成時刻UTC + 15m（DST影響なし）
- クーポン期間: `start<=now<end` で判定（境界厳密）

## 3. テスト
- 代表TZ: `Asia/Tokyo`, `America/Los_Angeles`, `Europe/Berlin`
- うるう秒の考慮は不要（OSに準拠）
