export async function cloneVoice(
  name: string,
  audioBuffer: Buffer
): Promise<string> {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("files", new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" }), "voice.wav");

  const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Voice cloning failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.voice_id;
}
