"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { calculateEssenceStrength } from "@/lib/utils";
import TrainingChat from "@/components/chat/TrainingChat";
import Button from "@/components/ui/Button";

export default function TrainPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [entryCount, setEntryCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (!snap.exists()) {
        router.push("/auth");
        return;
      }
      setEntryCount(snap.data().stats?.diaryEntries || 0);
      setReady(true);
    });
  }, [user, loading, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border border-teal-glow/40 border-t-teal-glow rounded-full animate-spin" />
      </div>
    );
  }

  const strength = calculateEssenceStrength(entryCount);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-teal-glow/8">
        <div className="flex items-center gap-4">
          <div
            className="font-mono text-sm tracking-[0.3em] uppercase cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span className="text-amber-pale/80">essence</span>
            <span className="text-teal-glow/60">.me</span>
          </div>
          <div className="w-px h-4 bg-teal-glow/10" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-teal-glow/30 uppercase">
            Training Mode
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Essence strength indicator */}
          <div className="flex items-center gap-3">
            <div className="w-20 h-[3px] bg-[#1a1510] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${strength}%`,
                  background: "linear-gradient(90deg, rgba(232,145,42,0.6), rgba(0,180,190,0.8))",
                  boxShadow: "0 0 6px rgba(0,180,190,0.2)",
                }}
              />
            </div>
            <span className="font-mono text-[10px] text-teal-glow/40">{strength}%</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </nav>

      {/* Chat */}
      <div className="flex-1">
        <TrainingChat onEntryCount={setEntryCount} />
      </div>
    </div>
  );
}
