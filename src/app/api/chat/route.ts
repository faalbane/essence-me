import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { generateVisitorResponse, type ChatMessage } from "@/lib/ai/claude";
import { findRelevantEntries, buildSystemPrompt } from "@/lib/ai/rag";

export async function POST(req: NextRequest) {
  try {
    const { username, message, sessionMessages = [] } = await req.json();

    if (!username || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Look up user by username
    const usernameDoc = await adminDb
      .collection("usernames")
      .doc(username)
      .get();
    if (!usernameDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const uid = usernameDoc.data()!.uid;
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data()!;
    if (userData.essenceStatus !== "ready") {
      return NextResponse.json(
        { error: "This essence is still being trained" },
        { status: 400 }
      );
    }

    // Rate limiting: check visitor session count
    const visitorId = req.headers.get("x-visitor-id") || "anonymous";
    const today = new Date().toISOString().split("T")[0];
    const rateLimitRef = adminDb
      .collection("rate_limits")
      .doc(`${visitorId}_${today}`);
    const rateLimitDoc = await rateLimitRef.get();
    const currentCount = rateLimitDoc.exists
      ? rateLimitDoc.data()!.count
      : 0;

    if (currentCount >= 20) {
      return NextResponse.json(
        { error: "Daily question limit reached (20/day)" },
        { status: 429 }
      );
    }

    // RAG: find relevant diary excerpts
    const relevantExcerpts = await findRelevantEntries(uid, message);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      userData.personalityProfile || {},
      relevantExcerpts,
      userData.displayName || username
    );

    // Build message history
    const messages: ChatMessage[] = [
      ...sessionMessages.slice(-8), // Keep last 8 messages for context
      { role: "user" as const, content: message },
    ];

    const response = await generateVisitorResponse(systemPrompt, messages);

    // Update rate limit
    await rateLimitRef.set(
      { count: currentCount + 1, date: today },
      { merge: true }
    );

    // Update visitor stats
    await adminDb
      .collection("users")
      .doc(uid)
      .update({
        "stats.totalQuestions": (userData.stats?.totalQuestions || 0) + 1,
      });

    return NextResponse.json({
      response,
      voiceId: userData.voiceId || null,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
