
const form = document.getElementById("generator-form");
const promptInput = document.getElementById("prompt");
const styleInput = document.getElementById("style");
const aspectInput = document.getElementById("aspect-ratio");

const generateButton = document.getElementById("generate-button");
const voiceButton = document.getElementById("voice-button");
const voiceStatus = document.getElementById("voice-status");

const message = document.getElementById("message");
const emptyState = document.getElementById("empty-state");
const resultImage = document.getElementById("result-image");
const downloadButton = document.getElementById("download-button");

document.getElementById("year").textContent =
  new Date().getFullYear();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const prompt = promptInput.value.trim();

  if (!prompt) {
    message.textContent = "Please describe your cartoon.";
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "Creating your cartoon...";
  message.textContent = "Please wait while AI creates your image.";

  downloadButton.hidden = true;
  resultImage.hidden = true;
  emptyState.hidden = false;

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        style: styleInput.value,
        aspectRatio: aspectInput.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Image generation failed.");
    }

    if (!data.image) {
      throw new Error("The server did not return an image.");
    }

    const imageUrl = data.image.startsWith("data:")
      ? data.image
      : `data:image/png;base64,${data.image}`;

    resultImage.onload = () => {
      emptyState.hidden = true;
      resultImage.hidden = false;
      downloadButton.href = imageUrl;
      downloadButton.hidden = false;
      message.textContent = "Your cartoon is ready!";
    };

    resultImage.onerror = () => {
      message.textContent = "Could not display the generated image.";
    };

    resultImage.src = imageUrl;

  } catch (error) {
    message.textContent = error.message || "Something went wrong.";
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "✨ Generate cartoon";
  }
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceButton.addEventListener("click", () => {
    try {
      voiceStatus.textContent = "Listening... Speak now.";
      recognition.start();
    } catch (error) {
      voiceStatus.textContent = "Please wait and try again.";
    }
  });

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;

    promptInput.value = promptInput.value
      ? promptInput.value + " " + spokenText
      : spokenText;

    voiceStatus.textContent = "Your speech has been added.";
  };

  recognition.onerror = (event) => {
    voiceStatus.textContent =
      event.error === "not-allowed"
        ? "Please allow microphone access in your browser."
        : "Voice input failed. Please try again.";
  };

  recognition.onend = () => {
    if (voiceStatus.textContent === "Listening... Speak now.") {
      voiceStatus.textContent = "Listening stopped.";
    }
  };

} else {
  voiceButton.disabled = true;
  voiceStatus.textContent = "Voice input is not supported in this browser.";
}

async function checkServer() {
  try {
    const response = await fetch("/api/health");

    if (!response.ok) {
      throw new Error("Server unavailable");
    }

    console.log("CartoonAI Studio server connected.");
  } catch (error) {
    console.error("Backend connection error:", error);
  }
}

checkServer();

