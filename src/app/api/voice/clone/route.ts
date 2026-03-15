import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth, adminStorage } from "@/lib/firebase/admin";
import { cloneVoice } from "@/lib/elevenlabs/clone";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    if (!audioFile) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Upload to Firebase Storage
    const bucket = adminStorage.bucket();
    const file = bucket.file(`voice-samples/${uid}/sample.wav`);
    await file.save(buffer, { contentType: "audio/wav" });

    // Clone voice with ElevenLabs
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const displayName = userDoc.data()?.displayName || "User";
    const voiceId = await cloneVoice(`${displayName}'s Essence`, buffer);

    // Save voice ID
    await adminDb.collection("users").doc(uid).update({ voiceId });

    return NextResponse.json({ voiceId });
  } catch (error) {
    console.error("Voice clone error:", error);
    return NextResponse.json(
      { error: "Failed to clone voice" },
      { status: 500 }
    );
  }
}
