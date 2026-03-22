import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { calculateEssenceStrength } from "@/lib/utils";
import ProfileCard from "@/components/profile/ProfileCard";
import VisitorChat from "@/components/chat/VisitorChat";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

interface UserData {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
  voiceId?: string;
  essenceStatus?: string;
  personalityProfile?: Record<string, unknown>;
  updatedAt?: string;
  stats?: { diaryEntries: number; totalQuestions: number };
}

async function getUserData(username: string): Promise<UserData | null> {
  const usernameDoc = await adminDb
    .collection("usernames")
    .doc(username)
    .get();
  if (!usernameDoc.exists) return null;

  const uid = usernameDoc.data()!.uid;
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return null;

  return { uid, ...(userDoc.data() as Omit<UserData, "uid">) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserData(username);

  if (!user) {
    return { title: "User not found — essence.me" };
  }

  return {
    title: `${user.displayName} — essence.me`,
    description: `Chat with ${user.displayName}'s AI essence. Ask anything and get responses in their voice and personality.`,
    openGraph: {
      title: `Talk to ${user.displayName}'s AI twin`,
      description: `Ask ${user.displayName} anything — their AI essence responds in their voice and personality.`,
      type: "profile",
      images: user.avatarUrl ? [user.avatarUrl] : [],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await getUserData(username);

  if (!user || user.essenceStatus === "new") {
    notFound();
  }

  const essenceStrength = calculateEssenceStrength(
    user.stats?.diaryEntries || 0
  );

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-3xl mx-auto w-full">
        <a href="/" className="font-mono text-sm tracking-[0.3em] uppercase">
          <span className="text-amber-pale/80">essence</span>
          <span className="text-teal-glow/60">.me</span>
        </a>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 sm:px-10 py-8 space-y-8">
        <ProfileCard
          displayName={user.displayName || username}
          username={username}
          avatarUrl={user.avatarUrl}
          essenceStrength={essenceStrength}
          totalQuestions={user.stats?.totalQuestions || 0}
          updatedAt={user.updatedAt}
        />

        <div className="glass-panel rounded-sm overflow-hidden">
          <VisitorChat
            username={username}
            displayName={user.displayName || username}
            avatarUrl={user.avatarUrl}
            hasVoice={!!user.voiceId}
          />
        </div>
      </main>

      <footer className="px-6 py-8 text-center">
        <a
          href="/"
          className="font-mono text-[10px] tracking-[0.3em] text-[#2a2520] uppercase hover:text-amber-glow/40 transition-colors"
        >
          Create your own essence
        </a>
      </footer>
    </div>
  );
}
