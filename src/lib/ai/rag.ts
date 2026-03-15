import { adminDb } from "@/lib/firebase/admin";
import { generateEmbedding, cosineSimilarity } from "./embeddings";

interface DiaryEntry {
  id: string;
  summary: string;
  embedding: number[];
  messages: { role: string; content: string }[];
}

export async function findRelevantEntries(
  uid: string,
  query: string,
  topK: number = 5
): Promise<string[]> {
  const queryEmbedding = generateEmbedding(query);

  const snapshot = await adminDb
    .collection("users")
    .doc(uid)
    .collection("diary_entries")
    .get();

  const entries: DiaryEntry[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.embedding) {
      entries.push({
        id: doc.id,
        summary: data.summary || "",
        embedding: data.embedding,
        messages: data.messages || [],
      });
    }
  });

  const scored = entries.map((entry) => ({
    entry,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map((s) => {
    const userMessages = s.entry.messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");
    return s.entry.summary || userMessages;
  });
}

export function buildSystemPrompt(
  personalityProfile: Record<string, unknown>,
  relevantExcerpts: string[],
  displayName: string
): string {
  const profile = JSON.stringify(personalityProfile, null, 2);
  const excerpts = relevantExcerpts.join("\n\n---\n\n");

  return `You are ${displayName}'s AI essence — a digital representation that speaks in their voice, reflects their personality, and shares their knowledge and perspectives.

PERSONALITY PROFILE:
${profile}

RELEVANT DIARY EXCERPTS (use these to inform your responses with specific details and authentic voice):
${excerpts}

INSTRUCTIONS:
- Respond as ${displayName} would — use their communication style, tone, and characteristic phrases
- Draw on the diary excerpts for specific details, stories, and opinions
- If asked about something not covered in the excerpts, respond in character but acknowledge you might not have full information on that topic
- Keep responses conversational and natural, as if ${displayName} is actually speaking
- Never break character or mention that you're an AI model
- Keep responses concise — aim for 2-4 sentences unless the topic warrants more detail`;
}
