// LINE連携（サーバーなしでできる、いちばん簡単な方法）
//
// 1. 学生向けの「LINEオープンチャット」（またはグループ）を作り、その招待リンクを
//    環境変数 NEXT_PUBLIC_LINE_COMMUNITY_URL に入れる。
//    → ワーカー画面と店舗画面に、参加ボタンが表示される。
// 2. 店舗が募集を出したら、「LINEで知らせる」ボタンで、募集の内容を
//    LINEの好きなトークやグループに送る（送り先は、LINEの画面で選ぶ）。
//
// 自動でプッシュ通知する仕組みではない。それには、LINE公式アカウントと
// サーバー側の処理が必要で、人数が増えてから検討する。

export const LINE_COMMUNITY_URL = process.env.NEXT_PUBLIC_LINE_COMMUNITY_URL || "";

// LINEに送る文章（募集の内容 + アプリへのリンク）
export function buildJobShareText(job, origin) {
  const wage = Number(job.hourlyWage || 0).toLocaleString();
  return [
    `【急募】${job.storeName}`,
    `${job.position} ／ ${job.workingHours} ／ 時給${wage}円`,
    `勤務地：${job.location}`,
    "",
    `応募はこちら（Shift Rescue）：${origin}/worker/dashboard`,
  ].join("\n");
}

// LINEの「メッセージを送る」画面を開くURL（送り先は、LINE側で選ぶ）
export function buildLineShareUrl(text) {
  return `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
}

// ボタンから呼ぶ：LINEの送信画面を、新しいタブで開く
export function shareJobToLine(job) {
  const text = buildJobShareText(job, window.location.origin);
  window.open(buildLineShareUrl(text), "_blank", "noopener,noreferrer");
}
