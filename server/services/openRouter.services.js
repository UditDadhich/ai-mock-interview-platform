import axios from "axios";

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Message array is empty.");
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // Optional: OpenRouter likes these for their rankings
          "HTTP-Referer": "http://localhost:5173", 
          "X-Title": "InterviewIQ",
        },
        // 1. Add a timeout (15 seconds) so your backend doesn't hang on DNS issues
        timeout: 15000, 
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      throw new Error("AI returned empty response.");
    }

    return content;

  } catch (error) {
    // 2. Log specific details to your server terminal for debugging
    if (error.code === 'ENOTFOUND') {
      console.error("DNS ERROR: Connection to OpenRouter failed. Check internet/DNS settings.");
    } else if (error.code === 'ECONNABORTED') {
      console.error("TIMEOUT ERROR: OpenRouter took too long to respond.");
    } else {
      console.error("OpenRouter Details:", error.response?.data || error.message);
    }

    // 3. Re-throw a descriptive error so your controller can send a better 500 response
    throw new Error(error.response?.data?.error?.message || "AI Service Unavailable");
  }
};