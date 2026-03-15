import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { textToSpeech } from "@/lib/elevenlabs/tts";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { text, username } = await req.json();
    if (!text || !username) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Look up user
    const usernameDoc = await adminDb
      .collection("usernames")
      .doc(username)
      .get();
    if (!usernameDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const uid = usernameDoc.data()!.uid;
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const voiceId = userDoc.data()?.voiceId;

    if (!voiceId) {
      return NextResponse.json(
        { error: "No voice configured" },
        { status: 400 }
      );
    }

    // Check cache
    const textHash = createHash("md5").update(text).digest("hex");
    const bucket = adminStorage.bucket();
    const cacheFile = bucket.file(`tts-cache/${uid}/${textHash}.mp3`);
    const [exists] = await cacheFile.exists();

    if (exists) {
      const [buffer] = await cacheFile.download();
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Generate TTS
    const audioBuffer = await textToSpeech(text, voiceId);

    // Cache it
    await cacheFile.save(audioBuffer, { contentType: "audio/mpeg" });

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
