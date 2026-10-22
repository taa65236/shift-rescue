// ワーカーの飲食経験（プロフィールと応募データの foodExperience）
// "none" | "hall" | "kitchen" | "both"。登録前のアカウントは null。

const LABELS = {
  none: "経験なし",
  hall: "接客",
  kitchen: "調理",
  both: "接客・調理",
};

export function foodExperienceLabel(value) {
  return LABELS[value] || "未登録";
}

// 「あり／なし」と、接客・調理のチェックから値を作る
export function toFoodExperience({ hasExperience, hall, kitchen }) {
  if (!hasExperience) return "none";
  if (hall && kitchen) return "both";
  if (hall) return "hall";
  if (kitchen) return "kitchen";
  return null;
}
