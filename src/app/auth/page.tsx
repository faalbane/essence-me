"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { signInWithGoogle } from "@/lib/firebase/client";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Button from "@/components/ui/Button";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [taken, setTaken] = useState(false);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!loading && !user) return;
    if (!user) return;

    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists() && snap.data().username) {
        router.push("/dashboard");
      } else {
        setNeedsUsername(true);
      }
    });
  }, [user, loading, router]);

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  }

  async function checkUsername(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);
    if (cleaned.length < 3) {
      setTaken(false);
      return;
    }
    setChecking(true);
    const snap = await getDoc(doc(db, "usernames", cleaned));
    setTaken(snap.exists());
    setChecking(false);
  }

  async function claimUsername() {
    if (!user || !username || username.length < 3 || taken) return;
    setClaiming(true);

    try {
      await setDoc(doc(db, "usernames", username), { uid: user.uid });
      await setDoc(doc(db, "users", user.uid), {
        username,
        displayName: user.displayName || username,
        avatarUrl: user.photoURL || null,
        voiceId: null,
        essenceStatus: "new",
        personalityProfile: null,
        stats: { diaryEntries: 0, totalQuestions: 0 },
        settings: { voiceEnabled: false, publicProfile: true },
        createdAt: new Date().toISOString(),
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to claim username:", err);
      setClaiming(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border border-teal-glow/40 border-t-teal-glow rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full space-y-8 text-center animate-drift-up">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-teal-glow/30" />
              <span className="font-mono text-[10px] tracking-[0.4em] text-teal-glow/40 uppercase">
                Authenticate
              </span>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-teal-glow/30" />
            </div>
            <h1 className="text-3xl font-bold text-amber-pale tracking-wide">
              Join{" "}
              <span className="text-teal-glow/80">essence.me</span>
            </h1>
            <p className="text-[#5a5040] text-sm">
              Create your AI twin in minutes
            </p>
          </div>
          <Button size="lg" onClick={handleSignIn} className="w-full">
            Continue with Google
          </Button>
        </div>
      </div>
    );
  }

  if (needsUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full space-y-6 animate-drift-up">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-amber-pale tracking-wide">
              Choose your identity
            </h1>
            <p className="text-[#5a5040] text-sm font-mono">
              essence.me/
              <span className="text-teal-glow/60">{username || "___"}</span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-glow/30 font-mono text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => checkUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-[#0a0d14] border border-teal-glow/10 rounded-sm pl-8 pr-4 py-3 text-amber-pale font-mono text-sm placeholder-[#2a2520] focus:outline-none focus:border-teal-glow/30 focus:shadow-[0_0_15px_rgba(0,180,190,0.05)] transition-all"
                maxLength={20}
              />
            </div>
            {username.length >= 3 && (
              <p className={`font-mono text-[10px] tracking-wider ${taken ? "text-red-400/80" : checking ? "text-[#4a4035]" : "text-teal-glow/60"}`}>
                {checking ? "SCANNING..." : taken ? "UNAVAILABLE" : "AVAILABLE"}
              </p>
            )}
            <Button
              size="lg"
              className="w-full"
              onClick={claimUsername}
              loading={claiming}
              disabled={username.length < 3 || taken || checking}
            >
              Claim Identity
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
