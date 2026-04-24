const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Warn at startup if the key is missing
if (!OPENAI_API_KEY) {
  console.warn(
    "[aiService] WARNING: OPENAI_API_KEY is not set. " +
    "Any attempt to call OpenAI will fail until this is configured."
  );
}

/**
 * callChatCompletion
 *
 * Simple wrapper around OpenAI's Chat Completions API.
 * Currently uses: gpt-4o-mini
 *
 * @param {string} prompt - The text/question to send to the model.
 * @returns {Promise<string>} - The model's reply text.
 */
export async function callChatCompletion(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured on the server. " +
      "Set it in your environment variables."
    );
  }

  if (!prompt || !prompt.trim()) {
    throw new Error("No prompt provided to callChatCompletion.");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    // Try to parse JSON safely
    let data = null;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("[aiService] Failed to parse OpenAI response JSON:", parseErr);
      throw new Error("Failed to parse response from OpenAI.");
    }

    // If OpenAI responded with an error, surface it clearly
    if (!response.ok) {
      const message = data?.error?.message || JSON.stringify(data);
      console.error("[aiService] OpenAI API returned an error:", message);
      throw new Error(`OpenAI API error: ${message}`);
    }

    const reply = data?.choices?.[0]?.message?.content || "";

    if (!reply) {
      console.warn("[aiService] OpenAI returned an empty reply.");
    }

    return reply;
  } catch (err) {
    console.error("[aiService] callChatCompletion error:", err);

    // Special handling for DNS / network issues
    if (err.code === "EAI_AGAIN" || /getaddrinfo/.test(err.message || "")) {
      throw new Error(
        "Unable to reach OpenAI from the server (network / DNS issue). " +
        "Check that the server has internet and can resolve api.openai.com."
      );
    }

    // Re-throw other errors with a generic wrapper
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Unknown error while calling OpenAI.");
    }
  }
}
