export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      apiKey,
      model = "gpt-4o-realtime-preview-2024-10-01",
      voice = "alloy",
      instructions
    } = req.body;

    // Use API key from request or environment
    const keyToUse = apiKey || process.env.OPENAI_API_KEY;

    if (!keyToUse) {
      return res.status(400).json({ error: "No API key provided" });
    }

    console.log(`Creating session with model: ${model}, voice: ${voice}`);

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${keyToUse}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        voice,
        modalities: ["audio", "text"],
        instructions: instructions || "You are a warm, empathetic AI therapist. Speak naturally and conversationally. Keep responses concise but meaningful.",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        },
        temperature: 0.8,
        max_response_output_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const sessionData = await response.json();
    console.log("Session created successfully");

    return res.status(200).json(sessionData);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: String(error) });
  }
}