import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Enable CORS for the frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Keep your real OpenAI key only on the server
// For development, you can pass it via environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "Server running", 
    timestamp: new Date().toISOString(),
    hasApiKey: !!OPENAI_API_KEY 
  });
});

// Simple route the browser can call to get a short-lived token
app.post("/session", async (req, res) => {
  try {
    const { 
      apiKey, // Allow API key from frontend for now
      model = "gpt-4o-realtime-preview-2024-10-01",
      voice = "alloy",
      instructions 
    } = req.body;

    // Use API key from request or environment
    const keyToUse = apiKey || OPENAI_API_KEY;
    
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
    
    // The response includes an ephemeral client_secret you'll use in the browser
    res.json(sessionData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: String(error) });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Session endpoint: http://localhost:${PORT}/session`);
  
  if (!OPENAI_API_KEY) {
    console.log("⚠️  No OPENAI_API_KEY environment variable set - will use API key from frontend requests");
  }
});