import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth, adminStorage } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const formData = await req.formData();
    const photo = formData.get("photo") as File;
    if (!photo) {
      return NextResponse.json({ error: "No photo" }, { status: 400 });
    }

    const buffer = Buffer.from(await photo.arrayBuffer());

    // For MVP: store the uploaded photo directly as avatar
    // TODO: integrate AI image generation for stylized portraits
    const bucket = adminStorage.bucket();
    const file = bucket.file(`avatars/${uid}/avatar.jpg`);
    await file.save(buffer, {
      contentType: photo.type,
      metadata: { cacheControl: "public, max-age=31536000" },
    });
    await file.makePublic();

    const avatarUrl = `https://storage.googleapis.com/${bucket.name}/avatars/${uid}/avatar.jpg`;

    await adminDb.collection("users").doc(uid).update({ avatarUrl });

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("Avatar error:", error);
    return NextResponse.json(
      { error: "Failed to generate avatar" },
      { status: 500 }
    );
  }
}
