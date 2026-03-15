import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { generateTrainingResponse, type ChatMessage } from "@/lib/ai/claude";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { updatePersonalityProfile } from "@/lib/ai/personality";

async function verifyAuth(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, category, sessionId, messages = [] } = await req.json();

    if (!message || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Generate training response
    const allMessages: ChatMessage[] = [
      ...messages.slice(-10),
      { role: "user" as const, content: message },
    ];

    const aiResponse = await generateTrainingResponse(category, allMessages);

    // Save diary entry
    const entryRef = sessionId
      ? adminDb
          .collection("users")
          .doc(uid)
          .collection("diary_entries")
          .doc(sessionId)
      : adminDb
          .collection("users")
          .doc(uid)
          .collection("diary_entries")
          .doc();

    const existingDoc = sessionId ? await entryRef.get() : null;
    const existingMessages = existingDoc?.exists
      ? existingDoc.data()!.messages
      : [];

    const updatedMessages = [
      ...existingMessages,
      { role: "user", content: message },
      { role: "assistant", content: aiResponse },
    ];

    // Generate embedding from all user messages in this entry
    const userText = updatedMessages
      .filter((m: { role: string }) => m.role === "user")
      .map((m: { content: string }) => m.content)
      .join(" ");
    const embedding = generateEmbedding(userText);

    await entryRef.set(
      {
        messages: updatedMessages,
        category,
        embedding,
        summary: userText.slice(0, 200),
        createdAt: existingDoc?.exists
          ? existingDoc.data()!.createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Update personality profile in background (every 3 entries)
    const entryCount = (
      await adminDb
        .collection("users")
        .doc(uid)
        .collection("diary_entries")
        .count()
        .get()
    ).data().count;

    if (entryCount % 3 === 0 || entryCount >= 5) {
      updatePersonalityProfile(uid).catch(console.error);
    }

    return NextResponse.json({
      response: aiResponse,
      sessionId: entryRef.id,
      entryCount,
    });
  } catch (error) {
    console.error("Train error:", error);
    return NextResponse.json(
      { error: "Failed to process training" },
      { status: 500 }
    );
  }
}
