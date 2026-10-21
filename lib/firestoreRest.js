// Firebase JS SDK（の内部通信方式）を使わず、
// Firestoreの「REST API」に直接fetchでアクセスするための薄いラッパー。
//
// 一部のネットワーク・セキュリティソフト環境では、Firebase SDKが使う
// 特殊な常時接続通信（WebChannel）だけがブロックされることがあるため、
// 通常のHTTPS通信（fetch）だけで完結するこちらの方式を採用している。
//
// users / jobs すべてのリクエストに、IDトークン（Authorization: Bearer ...）を付ける。
// users はルールで「ログイン本人のみ」に制限済み。
// jobs はステップ6でルールを閉じるときに、ログイン必須になる。

import { auth } from "@/lib/firebase";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ログイン中ユーザーのIDトークンをヘッダーにして返す。未ログインなら空。
// getIdToken() は期限切れが近いときに自動で更新してくれる。
async function authHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

// ---- JSの値 <-> FirestoreのREST表現 の変換 ----

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === "object") {
    return { mapValue: { fields: toFirestoreFields(value) } };
  }
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  return { stringValue: String(value) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return fields;
}

function fromFirestoreValue(fv) {
  if (!fv) return null;
  if ("stringValue" in fv) return fv.stringValue;
  if ("integerValue" in fv) return Number(fv.integerValue);
  if ("doubleValue" in fv) return fv.doubleValue;
  if ("booleanValue" in fv) return fv.booleanValue;
  if ("nullValue" in fv) return null;
  if ("arrayValue" in fv) return (fv.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in fv) return fromFirestoreFields(fv.mapValue.fields || {});
  return null;
}

function fromFirestoreFields(fields) {
  const obj = {};
  for (const [key, value] of Object.entries(fields || {})) {
    obj[key] = fromFirestoreValue(value);
  }
  return obj;
}

function docToJob(doc) {
  const id = doc.name.split("/").pop();
  return { id, ...fromFirestoreFields(doc.fields) };
}

function docToUser(doc) {
  const id = doc.name.split("/").pop();
  return { id, ...fromFirestoreFields(doc.fields) };
}

// ---- users（プロフィール）----

export async function getUserProfile(uid) {
  const res = await fetch(`${BASE_URL}/users/${uid}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`プロフィールの取得に失敗しました（${res.status}）`);
  const doc = await res.json();
  return docToUser(doc);
}

export async function createUserProfile(uid, { role, email }) {
  const profile = {
    role,
    email: email || "",
    displayName: "",
    storeName: null,
    contact: null,
    createdAt: new Date().toISOString(),
  };
  const res = await fetch(`${BASE_URL}/users?documentId=${encodeURIComponent(uid)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ fields: toFirestoreFields(profile) }),
  });
  if (res.status === 409) {
    return getUserProfile(uid);
  }
  if (!res.ok) throw new Error(`プロフィールの作成に失敗しました（${res.status}）`);
  return { id: uid, ...profile };
}

// プロフィールの一部の項目だけを更新する（役割 role は変えられない）
export async function updateUserFields(uid, partialFields) {
  const mask = Object.keys(partialFields)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");
  const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(uid)}?${mask}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ fields: toFirestoreFields(partialFields) }),
  });
  if (!res.ok) throw new Error(`プロフィールの更新に失敗しました（${res.status}）`);
}

// ---- 公開関数（jobs）----

// 募集の一覧は、「募集中のもの」と「自分が出したもの」だけを取る。
// すべての募集を毎回読むと、成立済みの古い募集が増えるほど、
// Firestoreの無料枠（1日の読み取り5万回）を使い切りやすくなるため。
export async function listJobs() {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const [openJobs, myJobs] = await Promise.all([
    runJobsQuery("status", "open"),
    runJobsQuery("ownerId", uid),
  ]);
  const byId = new Map();
  for (const job of [...openJobs, ...myJobs]) byId.set(job.id, job);
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

async function runJobsQuery(fieldPath, value) {
  const res = await fetch(`${BASE_URL}:runQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "jobs" }],
        where: {
          fieldFilter: {
            field: { fieldPath },
            op: "EQUAL",
            value: { stringValue: value },
          },
        },
        limit: 200,
      },
    }),
  });
  if (!res.ok) throw new Error(`募集一覧の取得に失敗しました（${res.status}）`);
  const rows = await res.json();
  return rows.filter((row) => row.document).map((row) => docToJob(row.document));
}

export async function getJobRemote(jobId) {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return null;
  const doc = await res.json();
  return docToJob(doc);
}

export async function createJob(jobData) {
  const fields = toFirestoreFields({
    storeName: jobData.storeName,
    position: jobData.position,
    workingHours: jobData.workingHours,
    hourlyWage: jobData.hourlyWage,
    location: jobData.location,
    description: jobData.description,
    createdAt: new Date().toISOString(),
    urgent: true,
    status: "open",
    matchedApplicantId: null,
    ownerId: jobData.ownerId,
  });
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`募集の作成に失敗しました（${res.status}）`);
  const data = await res.json();
  return data.name.split("/").pop();
}

async function patchJob(jobId, partialFields) {
  const fields = toFirestoreFields(partialFields);
  const mask = Object.keys(partialFields)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");
  const res = await fetch(`${BASE_URL}/jobs/${jobId}?${mask}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`更新に失敗しました（${res.status}）`);
  return res.json();
}

// ---- 応募者（jobs/{jobId}/applicants/{ワーカーのuid}）----
// 応募者は募集データの中ではなく、別の場所（サブコレクション）に1人1件で保存する。
// ドキュメントIDをワーカーのuidにすることで、同じ募集への二重応募も防げる。

export async function applyToJobRemote(jobId, workerUid, applicantInfo) {
  const job = await getJobRemote(jobId);
  if (!job) throw new Error("募集が見つかりませんでした");
  if (job.status === "matched") {
    throw new Error("この募集はすでに成立しています。");
  }
  const applicant = {
    workerId: workerUid,
    name: applicantInfo.name,
    contact: applicantInfo.contact,
    message: applicantInfo.message || "",
    appliedAt: new Date().toISOString(),
  };
  const res = await fetch(
    `${BASE_URL}/jobs/${jobId}/applicants?documentId=${encodeURIComponent(workerUid)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ fields: toFirestoreFields(applicant) }),
    }
  );
  if (res.status === 409) throw new Error("この募集にはすでに応募しています。");
  if (!res.ok) throw new Error(`応募に失敗しました（${res.status}）`);
}

export async function listApplicants(jobId) {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants?pageSize=200`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`応募者の取得に失敗しました（${res.status}）`);
  const data = await res.json();
  if (!data.documents) return [];
  return data.documents.map(docToJob);
}

export async function matchJobRemote(jobId, applicantId) {
  await patchJob(jobId, { status: "matched", matchedApplicantId: applicantId });
}

// 店舗が募集を取り消す（status を closed にする。データは残る）
export async function closeJobRemote(jobId) {
  await patchJob(jobId, { status: "closed" });
}
