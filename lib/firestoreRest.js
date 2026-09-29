// Firebase JS SDK（の内部通信方式）を使わず、
// Firestoreの「REST API」に直接fetchでアクセスするための薄いラッパー。
//
// 一部のネットワーク・セキュリティソフト環境では、Firebase SDKが使う
// 特殊な常時接続通信（WebChannel）だけがブロックされることがあるため、
// 通常のHTTPS通信（fetch）だけで完結するこちらの方式を採用している。
//
// Firestoreのセキュリティルールで `allow read, write: if true;` としている前提のため、
// 認証トークンなしでアクセスできる。

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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

// ---- 公開関数 ----

export async function listJobs() {
  const res = await fetch(`${BASE_URL}/jobs?pageSize=200`, { cache: "no-store" });
  if (!res.ok) throw new Error(`募集一覧の取得に失敗しました（${res.status}）`);
  const data = await res.json();
  if (!data.documents) return [];
  return documentsToJobs(data.documents);
}

function documentsToJobs(documents) {
  return documents
    .map(docToJob)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getJobRemote(jobId) {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, { cache: "no-store" });
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
    applicants: [],
  });
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`更新に失敗しました（${res.status}）`);
  return res.json();
}

export async function applyToJobRemote(jobId, applicantInfo) {
  const job = await getJobRemote(jobId);
  if (!job) throw new Error("募集が見つかりませんでした");
  const applicant = {
    id: crypto.randomUUID(),
    name: applicantInfo.name,
    contact: applicantInfo.contact,
    message: applicantInfo.message || "",
    appliedAt: new Date().toISOString(),
  };
  const applicants = [...(job.applicants || []), applicant];
  await patchJob(jobId, { applicants });
}

export async function matchJobRemote(jobId, applicantId) {
  await patchJob(jobId, { status: "matched", matchedApplicantId: applicantId });
}
