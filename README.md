# Shift Rescue

急な欠勤時に代わりのアルバイトをリアルタイムで探せるマッチングサービス（地域パイロットテスト版）。

React + Next.js（App Router）+ Tailwind CSS + Firebase Firestore（REST API直接利用）で構築されています。
**アカウント登録なしで、誰でも募集の投稿・応募ができる**構成になっています
（小規模な地域パイロット向け。本格運用する場合は認証の追加を検討してください）。

※ Firebase JS SDKが使う特殊な常時接続通信（WebChannel）が一部のネットワーク・
セキュリティソフト環境でブロックされる問題が確認されたため、通常のHTTPS通信（fetch）
だけで完結するFirestore REST APIを直接使う方式に変更しています。そのため画面の更新は
「完全リアルタイム」ではなく、4秒おきに最新状態を取得する方式です（体感的にはほぼ
リアルタイムです）。

---

## 1. Firebaseプロジェクトを作る（無料）

1. https://console.firebase.google.com にアクセスし、Googleアカウントでログイン
2. 「プロジェクトを作成」→ 好きな名前（例：shift-rescue）を入力して作成
3. 左メニュー「構築」→「Firestore Database」→「データベースの作成」
   - ロケーションは `asia-northeast1`（東京）を選択
   - モードは「テストモード」でOK（後で `firestore.rules` を反映します）
4. 左メニュー「プロジェクトの概要」の歯車アイコン →「プロジェクトの設定」
5. 「マイアプリ」で `</>`（ウェブ）アイコンをクリックし、アプリを登録
6. 表示される `firebaseConfig` の値を控えておく（次の手順で使います）

### Firestoreのルールを反映する

Firebaseコンソールの「Firestore Database」→「ルール」タブに、このプロジェクトの
`firestore.rules` の中身をコピーして貼り付け、「公開」をクリックしてください。
（誰でも読み書きできる、パイロットテスト用の設定です）

---

## 2. ローカルで動かす

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` を開き、手順1で控えた `firebaseConfig` の値を貼り付けます。

```bash
npm run dev
```

`http://localhost:3000` で動作します。

---

## 3. Vercelにデプロイして公開URLを発行する

1. このプロジェクトをGitHubリポジトリにアップロード
2. https://vercel.com にGitHubアカウントでログイン
3. 「Add New Project」→ 該当リポジトリを選択
4. 「Environment Variables」に `.env.local` と同じ内容
   （`NEXT_PUBLIC_FIREBASE_...` の6つ）を1つずつ登録
5. 「Deploy」をクリック

数分で `https://shift-rescue-xxxx.vercel.app` のような公開URLが発行され、
このURLを知っている人なら誰でもアクセスして募集の投稿・応募ができます。

---

## 画面一覧

| パス | 画面 |
| --- | --- |
| `/` | ログイン画面（店舗／ワーカー選択・認証なし） |
| `/store/dashboard` | 店舗ダッシュボード（募集一覧・新規募集ボタン） |
| `/store/new-request` | 欠員募集作成フォーム |
| `/store/applicants/[jobId]` | 応募者一覧・採用 |
| `/store/matched/[jobId]` | マッチング完了画面（採用者の連絡先を表示） |
| `/worker/dashboard` | ワーカーダッシュボード（募集カード一覧） |
| `/worker/apply/[jobId]` | 応募フォーム（名前・連絡先・一言メッセージ） |
| `/worker/complete` | 応募完了画面 |

## データ構造（Firestore）

`jobs` コレクションの1ドキュメント = 1つの欠員募集。

```
{
  storeName, position, workingHours, hourlyWage, location, description,
  createdAt: "2026-09-24T10:00:00.000Z",
  urgent: true,
  status: "open" | "matched",
  matchedApplicantId: null | "応募者のid",
  applicants: [
    { id, name, contact, message, appliedAt }
  ]
}
```

## パイロット運用にあたっての注意

- 認証がないため、誰でも募集の投稿・応募ができます。荒らし対策が必要になったら
  「店舗側だけ簡易パスワードを設ける」「Firebase Authenticationを追加する」等を検討してください。
- 応募者の連絡先（電話番号・LINE IDなど）がFirestoreにそのまま保存されます。
  個人情報の取り扱いについては、パイロット参加者に事前に説明し同意を得てください。
- マッチング後の実際の連絡（勤務時間の最終調整など）はアプリの外（電話・LINE）で行う想定です。
