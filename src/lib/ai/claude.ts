import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateVisitorResponse(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function extractPersonality(
  diaryEntries: string[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6-20250415",
    max_tokens: 2000,
    system:
      "You are a personality analyst. Given diary entries from a person, extract a detailed personality profile. Output a JSON object with these fields: voiceTraits (array of adjectives describing their communication style), values (array of core values), interests (array), communicationStyle (object with formality, humor, verbosity, empathy levels 1-10), examplePhrases (array of characteristic phrases they use), background (brief summary), expertise (array of topics they know well), quirks (array of unique personality traits). Be specific and grounded in what they actually wrote.",
    messages: [
      {
        role: "user",
        content: `Analyze these diary entries and extract a personality profile:\n\n${diaryEntries.join("\n\n---\n\n")}`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "{}";
}

export async function generateTrainingResponse(
  category: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: `You are a warm, curious interviewer helping someone build their AI essence. You're currently exploring the "${category}" category. Ask thoughtful follow-up questions that draw out personality, stories, opinions, and unique perspectives. Keep questions conversational and one at a time. If the user gives brief answers, gently encourage elaboration. After 4-5 exchanges on a topic, naturally transition to a new angle within the category.`,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}
