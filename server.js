
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

app.use("/api/", limiter);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Check server status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CartoonAI Studio"
  });
});

// Generate AI cartoon image
app.post("/api/generate-image", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OpenAI API key is not configured on the server."
      });
    }

    const { prompt, style, aspectRatio } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter an image description."
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        error: "Your description is too long."
      });
    }

    const sizes = {
      square: "1024x1024",
      landscape: "1536x1024",
      portrait: "1024x1536"
    };

    const selectedSize = sizes[aspectRatio] || "1024x1024";

    const finalPrompt =
      `${prompt.trim()}. Visual style: ${style || "3D cartoon animation"}. ` +
      "Create a high-quality, colourful cartoon illustration.";

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      size: selectedSize,
      n: 1
    });

    const imageData = result.data[0].b64_json;

    if (!imageData) {
      throw new Error("The AI service did not return an image.");
    }

    res.json({
      image: `data:image/png;base64,${imageData}`
    });

  } catch (error) {
    console.error("Image generation error:", error.message);

    res.status(error.status || 500).json({
      error: error.message || "Image generation failed."
    });
  }
});

// Video generation placeholder
app.post("/api/generate-animation", (req, res) => {
  res.status(501).json({
    error: "Video generation is not connected yet."
  });
});

// Website homepage
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CartoonAI Studio running on port ${PORT}`);
});
