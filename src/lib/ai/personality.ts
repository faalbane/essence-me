import { adminDb } from "@/lib/firebase/admin";
import { extractPersonality } from "./claude";

export async function updatePersonalityProfile(uid: string): Promise<void> {
  const snapshot = await adminDb
    .collection("users")
    .doc(uid)
    .collection("diary_entries")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const entries: string[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const userMessages = (data.messages || [])
      .filter((m: { role: string }) => m.role === "user")
      .map((m: { content: string }) => m.content)
      .join("\n");
    if (userMessages) entries.push(userMessages);
  });

  if (entries.length === 0) return;

  const profileJson = await extractPersonality(entries);

  let profile;
  try {
    const cleaned = profileJson.replace(/```json\n?|\n?```/g, "").trim();
    profile = JSON.parse(cleaned);
  } catch {
    profile = { raw: profileJson };
  }

  await adminDb.collection("users").doc(uid).update({
    personalityProfile: profile,
    essenceStatus: entries.length >= 5 ? "ready" : "training",
    "stats.diaryEntries": entries.length,
    updatedAt: new Date().toISOString(),
  });
}

export function calculateEssenceStrength(entryCount: number): number {
  // 0-100 scale based on diary entries
  if (entryCount === 0) return 0;
  if (entryCount >= 20) return 100;
  return Math.min(100, Math.round((entryCount / 20) * 100));
}
