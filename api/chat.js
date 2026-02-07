export default async function handler(req, res) {

  // ✅ Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed"
    });
  }

  try {
    const { message } = req.body;

    // ✅ Validate input
    if (!message) {
      return res.status(400).json({
        error: "Message required"
      });
    }

    // ✅ API Key check
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "Missing GROQ_API_KEY in Vercel Environment Variables"
      });
    }

    // ===============================
    // ✅ Generate YouTube + Instagram Links
    // ===============================
    const youtubeLink =
      "https://www.youtube.com/results?search_query=" +
      encodeURIComponent(message);

    const instagramLink =
      "https://www.instagram.com/explore/tags/" +
      encodeURIComponent(message.replace(/\s+/g, ""));

    // ===============================
    // ✅ Call Groq API
    // ===============================
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",

          messages: [
            {
              role: "system",
              content:
                "Reply ONLY in bullet points. Each line must start with '- '. English only."
            },
            {
              role: "user",
              content: message
            }
          ],
        }),
      }
    );

    const data = await response.json();

    // ===============================
    // ✅ Handle Groq API Errors
    // ===============================
    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "Groq API failed"
      });
    }

    // ===============================
    // ✅ Safe Reply Check
    // ===============================
    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({
        error: "No reply received from Groq API"
      });
    }

    // ===============================
    // ✅ Send Reply + Links Back
    // ===============================
    return res.status(200).json({
      reply: data.choices[0].message.content,
      youtube: youtubeLink,
      instagram: instagramLink
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
